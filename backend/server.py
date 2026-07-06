from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import base64
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from chat_service import chat_service
from image_service import generate_concept_image
from models import (
    ChatMessage, ChatResponse, 
    ThreeDModel, ThreeDModelCreate,
    PrintRequest, PrintRequestCreate,
    UserCreate, UserLogin, User, Token,
    Order, OrderCreate, OrderUpdate
)
from auth_utils import (
    verify_password, get_password_hash, 
    create_access_token, decode_access_token
)

security = HTTPBearer()


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    datenschutz_accepted: bool = True

class ContactFormResponse(BaseModel):
    id: str
    message: str

class ContactConfirmRequest(BaseModel):
    agb_accepted: bool
    haftung_accepted: bool
    widerruf_accepted: bool

# Branded email layout: every mail gets the same clean Kathodik design.
def _email_layout(inner_html: str) -> str:
    year = datetime.now(timezone.utc).year
    return f"""
    <div style="background:#f1f5f9;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;">
        <div style="text-align:center;padding-bottom:20px;">
          <span style="font-size:22px;font-weight:800;color:#1e293b;letter-spacing:-0.5px;">Kathodik</span><br>
          <span style="font-size:10px;font-weight:700;letter-spacing:3px;color:#2c7a7b;text-transform:uppercase;">Galvanotechnik</span>
        </div>
        <div style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <div style="height:5px;background:#2c7a7b;"></div>
          <div style="padding:32px 28px;color:#334155;font-size:15px;line-height:1.6;">
            {inner_html}
          </div>
        </div>
        <div style="text-align:center;padding-top:20px;color:#94a3b8;font-size:12px;line-height:1.6;">
          Kathodik – Galvanotechnik · <a href="https://kathodik.de" style="color:#2c7a7b;text-decoration:none;">kathodik.de</a><br>
          service@kathodik.com · © {year} Kathodik
        </div>
      </div>
    </div>
    """

# Ein-Klick-Buttons für die Admin-Benachrichtigung (bestätigen/ablehnen ohne Login)
def _order_action_buttons(order_id: str, token: str) -> str:
    base = os.environ.get('FRONTEND_URL', 'https://kathodik.de')
    return f"""
    <div style="text-align:center;margin:24px 0;">
      <a href="{base}/api/orders/{order_id}/action?token={token}&action=confirm"
         style="display:inline-block;padding:12px 28px;background:#2c7a7b;color:white;text-decoration:none;border-radius:999px;font-weight:bold;margin:4px;">✔ Auftrag bestätigen</a>
      <a href="{base}/api/orders/{order_id}/action?token={token}&action=decline"
         style="display:inline-block;padding:12px 28px;background:#ffffff;color:#dc2626;border:2px solid #dc2626;text-decoration:none;border-radius:999px;font-weight:bold;margin:4px;">✕ Ablehnen</a>
    </div>"""

# Resend email helper
async def send_email_via_resend(to_email: str, subject: str, html_content: str, attachments: list = None):
    """Send email using Resend API (non-blocking). Falls back to verified default sender.
    attachments: optional list of {"filename": str, "content": base64-str}."""
    resend_key = os.environ.get('RESEND_API_KEY')
    sender = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
    if not resend_key:
        logger.warning(f"RESEND_API_KEY not set, skipping email to {to_email}")
        return None
    try:
        import resend
        resend.api_key = resend_key
        params = {
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": _email_layout(html_content),
        }
        if attachments:
            params["attachments"] = attachments
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent OK to {to_email} via {sender} - id={result.get('id') if isinstance(result, dict) else result}")
        return result
    except Exception as e:
        err_msg = str(e)
        logger.error(f"Email send FAILED to {to_email} via {sender}: {err_msg}")
        # Fallback: try with Resend's verified default sender (only delivers to account owner)
        if 'domain is not verified' in err_msg.lower() or 'verify a domain' in err_msg.lower():
            try:
                import resend
                resend.api_key = resend_key
                fallback_params = {
                    "from": "Kathodik <onboarding@resend.dev>",
                    "to": [to_email],
                    "subject": f"[Fallback] {subject}",
                    "html": _email_layout(html_content),
                }
                if attachments:
                    fallback_params["attachments"] = attachments
                result = await asyncio.to_thread(resend.Emails.send, fallback_params)
                logger.info(f"Fallback email sent to {to_email}")
                return result
            except Exception as e2:
                logger.error(f"Fallback email also failed to {to_email}: {e2}")
        return None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Chat AI endpoints
@api_router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Send message to AI chatbot"""
    try:
        response = await chat_service.send_message(
            message.session_id, message.message, image_data=message.image_data
        )
        return ChatResponse(response=response, session_id=message.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        history = await chat_service.get_chat_history(session_id)
        return {"messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/chat/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history"""
    try:
        await chat_service.clear_history(session_id)
        return {"message": "Chat history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Auth helper function
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

# Contact Form endpoint
@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact(form: ContactFormRequest):
    """Submit a contact form message - sends confirmation link to customer."""
    contact_id = str(uuid.uuid4())
    confirmation_token = secrets.token_urlsafe(32)
    frontend_url = os.environ.get('FRONTEND_URL', '').rstrip('/')
    confirm_link = f"{frontend_url}/bestaetigung/{confirmation_token}" if frontend_url else f"/bestaetigung/{confirmation_token}"

    doc = {
        "id": contact_id,
        "name": form.name,
        "email": form.email,
        "phone": form.phone,
        "message": form.message,
        "status": "pending_confirmation",
        "datenschutz_accepted": True,
        "datenschutz_accepted_at": datetime.now(timezone.utc).isoformat(),
        "confirmation_token": confirmation_token,
        "agb_accepted": False,
        "haftung_accepted": False,
        "widerruf_accepted": False,
        "confirmed_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(doc)

    # Send notification email to admin
    await send_email_via_resend(
        to_email="service@kathodik.com",
        subject=f"Neue Kontaktanfrage von {form.name}",
        html_content=f"""
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> {form.name}</p>
        <p><strong>E-Mail:</strong> {form.email}</p>
        <p><strong>Telefon:</strong> {form.phone or 'Nicht angegeben'}</p>
        <p><strong>Nachricht:</strong></p>
        <p>{form.message}</p>
        <p><em>Status: Wartet auf Bestaetigung des Kunden (AGB, Haftung, Widerruf)</em></p>
        """
    )

    # Send confirmation link to customer
    await send_email_via_resend(
        to_email=form.email,
        subject="Kathodik - Bitte bestaetigen Sie Ihre Anfrage",
        html_content=f"""
        <h2>Vielen Dank fuer Ihre Anfrage, {form.name}!</h2>
        <p>Wir haben Ihre Nachricht erhalten. Damit wir den Auftrag verbindlich anlegen koennen,
        bestaetigen Sie bitte unsere <strong>AGB</strong>, den <strong>Haftungsausschluss</strong>
        und die <strong>Widerrufsbelehrung</strong> ueber den folgenden Link:</p>
        <p style="margin: 24px 0;">
            <a href="{confirm_link}" style="background:#2c7a7b;color:#fff;padding:12px 24px;text-decoration:none;border-radius:9999px;font-weight:600;">
                Auftrag jetzt bestaetigen
            </a>
        </p>
        <p style="color:#64748b;font-size:13px;">Oder kopieren Sie diesen Link in Ihren Browser:<br>{confirm_link}</p>
        <p>Erst nach Ihrer Bestaetigung beginnen wir mit der Bearbeitung.</p>
        <br>
        <p>Mit freundlichen Gruessen,</p>
        <p><strong>Kathodik - Galvanotechnik</strong><br>Hannes Barfuss</p>
        """
    )

    return ContactFormResponse(
        id=contact_id,
        message="Bestaetigungslink wurde per E-Mail versendet"
    )

@api_router.get("/contact/confirm/{token}")
async def get_contact_by_token(token: str):
    """Get pending contact request by confirmation token (public)."""
    doc = await db.contact_messages.find_one({"confirmation_token": token}, {"_id": 0, "confirmation_token": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Bestaetigungslink ungueltig oder abgelaufen")
    return {
        "id": doc["id"],
        "name": doc["name"],
        "email": doc["email"],
        "message": doc["message"],
        "status": doc.get("status", "pending_confirmation"),
        "confirmed_at": doc.get("confirmed_at"),
        "created_at": doc["created_at"],
    }

@api_router.post("/contact/confirm/{token}")
async def confirm_contact(token: str, body: ContactConfirmRequest):
    """Customer confirms AGB + Haftung + Widerruf for a pending contact request."""
    if not (body.agb_accepted and body.haftung_accepted and body.widerruf_accepted):
        raise HTTPException(status_code=400, detail="Bitte alle drei Punkte bestaetigen")
    doc = await db.contact_messages.find_one({"confirmation_token": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Bestaetigungslink ungueltig oder abgelaufen")
    if doc.get("status") == "confirmed":
        return {"status": "already_confirmed", "id": doc["id"]}

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.update_one(
        {"confirmation_token": token},
        {"$set": {
            "agb_accepted": True,
            "haftung_accepted": True,
            "widerruf_accepted": True,
            "confirmed_at": now_iso,
            "status": "confirmed",
        }}
    )

    # Notify admin
    await send_email_via_resend(
        to_email="service@kathodik.com",
        subject=f"Auftrag bestaetigt: {doc['name']}",
        html_content=f"""
        <h2>Auftrag wurde vom Kunden bestaetigt</h2>
        <p><strong>Name:</strong> {doc['name']}</p>
        <p><strong>E-Mail:</strong> {doc['email']}</p>
        <p><strong>Bestaetigt am:</strong> {now_iso}</p>
        <p>AGB, Haftungsausschluss und Widerrufsbelehrung wurden zur Kenntnis genommen.</p>
        <p><strong>Urspruengliche Nachricht:</strong><br>{doc['message']}</p>
        """
    )
    # Notify customer
    await send_email_via_resend(
        to_email=doc["email"],
        subject="Kathodik - Auftrag erfolgreich bestaetigt",
        html_content=f"""
        <h2>Vielen Dank, {doc['name']}!</h2>
        <p>Ihre Bestaetigung der AGB, des Haftungsausschlusses und der Widerrufsbelehrung ist bei uns eingegangen.</p>
        <p>Wir beginnen nun mit der Bearbeitung und melden uns in Kuerze bei Ihnen.</p>
        <br>
        <p>Mit freundlichen Gruessen,</p>
        <p><strong>Kathodik - Galvanotechnik</strong><br>Hannes Barfuss</p>
        """
    )

    return {"status": "confirmed", "id": doc["id"], "confirmed_at": now_iso}

@api_router.get("/contact/messages")
async def get_contact_messages(current_user: User = Depends(get_current_user)):
    """Get all contact messages (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

# 3D Model endpoints
@api_router.post("/3d-models", response_model=ThreeDModel)
async def create_3d_model(model: ThreeDModelCreate):
    """Create a 3D model configuration"""
    model_dict = model.dict()
    model_obj = ThreeDModel(**model_dict)
    await db.threed_models.insert_one(model_obj.dict())
    return model_obj

@api_router.get("/3d-models/{model_id}", response_model=ThreeDModel)
async def get_3d_model(model_id: str):
    """Get a 3D model by ID"""
    model = await db.threed_models.find_one({"id": model_id})
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return ThreeDModel(**model)

@api_router.get("/3d-models", response_model=List[ThreeDModel])
async def list_3d_models(email: Optional[str] = None):
    """List all 3D models, optionally filtered by email"""
    query = {"customer_email": email} if email else {}
    models = await db.threed_models.find(query).sort("created_at", -1).to_list(100)
    return [ThreeDModel(**model) for model in models]

# Print Request endpoints
@api_router.post("/print-requests", response_model=PrintRequest)
async def create_print_request(request: PrintRequestCreate):
    """Create a print request to partner company"""
    request_dict = request.dict()
    request_obj = PrintRequest(**request_dict)
    await db.print_requests.insert_one(request_obj.dict())
    return request_obj

@api_router.get("/print-requests/{request_id}", response_model=PrintRequest)
async def get_print_request(request_id: str):
    """Get a print request by ID"""
    request = await db.print_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return PrintRequest(**request)

@api_router.get("/print-requests", response_model=List[PrintRequest])
async def list_print_requests(email: Optional[str] = None):
    """List all print requests, optionally filtered by email"""
    query = {"customer_email": email} if email else {}
    requests = await db.print_requests.find(query).sort("created_at", -1).to_list(100)
    return [PrintRequest(**req) for req in requests]

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register a new user with email verification"""
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    
    # Create user (unverified)
    user_dict = user_data.dict(exclude={"password"})
    user_dict["password_hash"] = get_password_hash(user_data.password)
    user_dict["is_admin"] = False  # Admin can only be set via database
    user_dict["is_verified"] = False
    user_dict["verification_token"] = verification_token
    user_obj = User(**user_dict)
    
    await db.users.insert_one({**user_obj.dict(), "password_hash": user_dict["password_hash"], "is_verified": False, "verification_token": verification_token})
    
    # Send verification email
    frontend_url = os.environ.get('FRONTEND_URL', '')
    verify_url = f"{frontend_url}/portal/login?verify={verification_token}"
    
    await send_email_via_resend(
        to_email=user_data.email,
        subject="Kathodik - E-Mail Verifizierung",
        html_content=f"""
        <h2>Willkommen bei Kathodik, {user_data.name}!</h2>
        <p>Bitte klicken Sie auf den folgenden Link, um Ihre E-Mail-Adresse zu bestätigen:</p>
        <p><a href="{verify_url}" style="display:inline-block;padding:12px 24px;background:#2c7a7b;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">E-Mail bestätigen</a></p>
        <p>Oder verwenden Sie diesen Verifizierungscode: <strong>{verification_token[:8].upper()}</strong></p>
        <br>
        <p>Mit freundlichen Gruessen,</p>
        <p><strong>Kathodik - Galvanotechnik</strong></p>
        """
    )
    
    # Create token
    access_token = create_access_token(data={"sub": user_obj.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj.dict(),
        "verification_required": True,
        "message": "Registrierung erfolgreich. Bitte pruefen Sie Ihre E-Mail."
    }

@api_router.post("/auth/verify-email")
async def verify_email(token: str = None, code: str = None):
    """Verify email address"""
    query = {}
    if token:
        query = {"verification_token": token}
    elif code:
        query = {"verification_token": {"$regex": f"^{code.lower()}", "$options": "i"}}
    else:
        raise HTTPException(status_code=400, detail="Verifizierungstoken oder -code erforderlich")
    
    user = await db.users.find_one(query)
    if not user:
        raise HTTPException(status_code=400, detail="Ungueltiger Verifizierungstoken")
    
    await db.users.update_one(
        {"email": user["email"]},
        {"$set": {"is_verified": True}, "$unset": {"verification_token": ""}}
    )
    
    return {"message": "E-Mail erfolgreich verifiziert", "email": user["email"]}

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.email})
    
    return Token(access_token=access_token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# Password Reset endpoints
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists
        return {"message": "Falls ein Konto mit dieser E-Mail existiert, wurde ein Reset-Link gesendet."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"reset_token": reset_token, "reset_token_expires": expires_at}}
    )
    
    # Send reset email
    frontend_url = os.environ.get('FRONTEND_URL', '')
    reset_url = f"{frontend_url}/portal/login?reset={reset_token}"
    
    await send_email_via_resend(
        to_email=request.email,
        subject="Kathodik - Passwort zurücksetzen",
        html_content=f"""
        <h2>Passwort zurücksetzen</h2>
        <p>Sie haben angefordert, Ihr Passwort zurückzusetzen.</p>
        <p>Klicken Sie auf den folgenden Link, um ein neues Passwort festzulegen:</p>
        <p><a href="{reset_url}" style="display:inline-block;padding:12px 24px;background:#2c7a7b;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Neues Passwort setzen</a></p>
        <p style="color:#666;font-size:12px;">Dieser Link ist 1 Stunde lang gültig. Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.</p>
        <br>
        <p>Mit freundlichen Grüßen,</p>
        <p><strong>Kathodik - Galvanotechnik</strong></p>
        """
    )
    
    return {"message": "Falls ein Konto mit dieser E-Mail existiert, wurde ein Reset-Link gesendet."}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token"""
    user = await db.users.find_one({"reset_token": request.token})
    if not user:
        raise HTTPException(status_code=400, detail="Ungültiger oder abgelaufener Reset-Token")
    
    # Check expiry
    expires = user.get("reset_token_expires", "")
    if expires and datetime.fromisoformat(expires) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset-Token ist abgelaufen. Bitte erneut anfordern.")
    
    # Update password
    new_hash = get_password_hash(request.new_password)
    await db.users.update_one(
        {"email": user["email"]},
        {"$set": {"password_hash": new_hash}, "$unset": {"reset_token": "", "reset_token_expires": ""}}
    )
    
    return {"message": "Passwort erfolgreich geändert. Sie können sich jetzt anmelden."}

# Order endpoints
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate, current_user: User = Depends(get_current_user)):
    """Create a new order"""
    order_dict = order.dict()
    order_dict["customer_email"] = current_user.email
    order_dict["customer_name"] = current_user.name
    order_obj = Order(**order_dict)
    await db.orders.insert_one(order_obj.dict())
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def list_orders(current_user: User = Depends(get_current_user)):
    """List orders for current user"""
    query = {"customer_email": current_user.email}
    if current_user.is_admin:
        query = {}  # Admin sees all orders
    
    orders = await db.orders.find(query).sort("created_at", -1).to_list(100)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific order"""
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns the order or is admin
    if order["customer_email"] != current_user.email and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return Order(**order)

@api_router.patch("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, update: OrderUpdate, current_user: User = Depends(get_current_user)):
    """Update order (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_dict = {k: v for k, v in update.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.orders.update_one({"id": order_id}, {"$set": update_dict})
    
    updated_order = await db.orders.find_one({"id": order_id})
    return Order(**updated_order)

# ─── Settings Endpoints (Order Acceptance Toggle) ───
class SettingsResponse(BaseModel):
    accepting_orders: bool
    pause_message: Optional[str] = None

class SettingsUpdate(BaseModel):
    accepting_orders: bool
    pause_message: Optional[str] = None

@api_router.get("/settings/accepting-orders", response_model=SettingsResponse)
async def get_accepting_orders():
    """Get current order acceptance status (public)"""
    settings = await db.settings.find_one({"key": "accepting_orders"}, {"_id": 0})
    if not settings:
        return SettingsResponse(accepting_orders=True, pause_message=None)
    return SettingsResponse(
        accepting_orders=settings.get("value", True),
        pause_message=settings.get("pause_message")
    )

@api_router.put("/settings/accepting-orders", response_model=SettingsResponse)
async def update_accepting_orders(update: SettingsUpdate, current_user: User = Depends(get_current_user)):
    """Toggle order acceptance (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.settings.update_one(
        {"key": "accepting_orders"},
        {"$set": {
            "key": "accepting_orders",
            "value": update.accepting_orders,
            "pause_message": update.pause_message,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": current_user.email
        }},
        upsert=True
    )
    
    # If re-enabling, notify waitlisted users
    if update.accepting_orders:
        waitlist = await db.waitlist.find({"notified": {"$ne": True}}, {"_id": 0}).to_list(500)
        for entry in waitlist:
            await send_email_via_resend(
                to_email=entry["email"],
                subject="Kathodik - Wir nehmen wieder Aufträge an!",
                html_content=f"""
                <h2>Gute Nachrichten!</h2>
                <p>Wir freuen uns, Ihnen mitteilen zu können, dass Kathodik wieder Aufträge entgegennimmt.</p>
                <p>Besuchen Sie unsere Webseite, um Ihre Anfrage zu stellen:</p>
                <p><a href="{os.environ.get('FRONTEND_URL', '')}/services" style="display:inline-block;padding:12px 24px;background:#2c7a7b;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Jetzt anfragen</a></p>
                <br>
                <p>Mit freundlichen Grüßen,</p>
                <p><strong>Kathodik - Galvanotechnik</strong></p>
                """
            )
            await db.waitlist.update_one(
                {"email": entry["email"]},
                {"$set": {"notified": True, "notified_at": datetime.now(timezone.utc).isoformat()}}
            )
    
    return SettingsResponse(accepting_orders=update.accepting_orders, pause_message=update.pause_message)

# ─── Pricing & Warenkorb (Pauschalpreise je Produkt × Metallfaktor) ───
DEFAULT_PRICING = {
    "key": "pricing",
    "cart_enabled": False,
    "products": [
        {"id": "ring", "name": "Ring", "base_price_eur": 29.0, "active": True},
        {"id": "kette", "name": "Kette", "base_price_eur": 59.0, "active": True},
        {"id": "armband", "name": "Armband", "base_price_eur": 49.0, "active": True},
        {"id": "uhr", "name": "Uhrengehäuse", "base_price_eur": 89.0, "active": True},
        {"id": "muenze", "name": "Münze / Medaille", "base_price_eur": 24.0, "active": True},
        {"id": "brille", "name": "Brillengestell", "base_price_eur": 69.0, "active": True},
        {"id": "besteck", "name": "Besteckteil", "base_price_eur": 39.0, "active": True},
    ],
    "metal_factors": {
        "Zn": 1.0, "Sn": 1.1, "Cu": 1.2, "Ni": 1.3, "Co": 1.4, "WB": 1.5,
        "Cr": 1.6, "Ag": 1.8, "Ru": 2.5, "Pd": 3.0, "Au": 4.0, "Pt": 4.5, "Rh": 5.0,
    },
    # Zustand des Bauteils (Aufbereitungsaufwand)
    "condition_factors": {"neu": 1.0, "leicht": 1.15, "stark": 1.4},
    # Grundmaterial (Vorbehandlungsaufwand)
    "materials": [
        {"id": "kupfer", "name": "Kupfer", "factor": 1.0},
        {"id": "messing", "name": "Messing", "factor": 1.0},
        {"id": "silber", "name": "Silber", "factor": 1.0},
        {"id": "stahl", "name": "Stahl", "factor": 1.15},
        {"id": "edelstahl", "name": "Edelstahl", "factor": 1.25},
        {"id": "zamak", "name": "Zink-Druckguss", "factor": 1.2},
        {"id": "aluminium", "name": "Aluminium", "factor": 1.35},
        {"id": "unbekannt", "name": "Unbekannt / Sonstiges", "factor": 1.2},
    ],
    # Finish/Modifikation (Aufschlag je Ausführung; fehlende IDs zählen als 1.0)
    "finish_factors": {
        "cr-black": 1.2, "ni-black": 1.15, "ni-satin": 1.1, "cu-red": 1.05,
        "cu-antique": 1.1, "zn-yellow": 1.05, "zn-blue": 1.05, "rh-black": 1.25,
        "pd-bright": 1.1, "wb-bright": 1.1, "au-rose": 1.15,
    },
}

async def _get_pricing():
    doc = await db.settings.find_one({"key": "pricing"}, {"_id": 0})
    return doc or DEFAULT_PRICING

class PricingUpdate(BaseModel):
    cart_enabled: bool
    products: List[dict]
    metal_factors: dict
    condition_factors: dict = {}
    materials: List[dict] = []
    finish_factors: dict = {}

@api_router.get("/pricing")
async def get_pricing():
    """Public pricing config for the cart order flow"""
    return await _get_pricing()

@api_router.put("/pricing")
async def update_pricing(update: PricingUpdate, current_user: User = Depends(get_current_user)):
    """Update pricing config (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    for p in update.products:
        if not p.get("id") or not p.get("name"):
            raise HTTPException(status_code=400, detail="Produkt braucht id und name")
        try:
            p["base_price_eur"] = round(float(p.get("base_price_eur", 0)), 2)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail=f"Ungültiger Basispreis bei {p.get('name')}")
        if p["base_price_eur"] < 0:
            raise HTTPException(status_code=400, detail=f"Negativer Basispreis bei {p.get('name')}")
        p["active"] = bool(p.get("active", True))
    def _clean_factors(raw: dict, label: str) -> dict:
        cleaned = {}
        for key, f in raw.items():
            try:
                cleaned[key] = round(float(f), 2)
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail=f"Ungültiger {label}-Faktor für {key}")
            if cleaned[key] <= 0:
                raise HTTPException(status_code=400, detail=f"{label}-Faktor für {key} muss > 0 sein")
        return cleaned

    factors = _clean_factors(update.metal_factors, "Metall")
    condition_factors = _clean_factors(update.condition_factors or DEFAULT_PRICING["condition_factors"], "Zustand")
    finish_factors = _clean_factors(update.finish_factors or {}, "Finish")
    materials = update.materials or DEFAULT_PRICING["materials"]
    for m in materials:
        if not m.get("id") or not m.get("name"):
            raise HTTPException(status_code=400, detail="Material braucht id und name")
        try:
            m["factor"] = round(float(m.get("factor", 1.0)), 2)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail=f"Ungültiger Faktor bei Material {m.get('name')}")
        if m["factor"] <= 0:
            raise HTTPException(status_code=400, detail=f"Faktor bei Material {m.get('name')} muss > 0 sein")
    doc = {
        "key": "pricing",
        "cart_enabled": update.cart_enabled,
        "products": update.products,
        "metal_factors": factors,
        "condition_factors": condition_factors,
        "materials": materials,
        "finish_factors": finish_factors,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": current_user.email,
    }
    await db.settings.update_one({"key": "pricing"}, {"$set": doc}, upsert=True)
    return await _get_pricing()

class CartItemRequest(BaseModel):
    product_id: str
    metal: str          # Metall-Symbol, z. B. "Au"
    finish: Optional[str] = None        # Finish-ID, z. B. "au-rose"
    finish_name: Optional[str] = None   # Anzeigename, z. B. "Roségold"
    condition: Optional[str] = None     # neu | leicht | stark
    base_material: Optional[str] = None # Material-ID, z. B. "messing"
    quantity: int = Field(ge=1, le=500)

class CartOrderRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    note: Optional[str] = None
    items: List[CartItemRequest] = Field(min_length=1, max_length=30)

@api_router.post("/cart/order")
async def create_cart_order(request: CartOrderRequest):
    """Create a cart order; total is computed server-side from the pricing config."""
    pricing = await _get_pricing()
    products = {p["id"]: p for p in pricing.get("products", []) if p.get("active", True)}
    factors = pricing.get("metal_factors", {})
    condition_factors = pricing.get("condition_factors", {})
    material_factors = {m["id"]: m for m in pricing.get("materials", [])}
    finish_factors = pricing.get("finish_factors", {})

    lines = []
    total = 0.0
    for item in request.items:
        product = products.get(item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Unbekanntes Produkt: {item.product_id}")
        factor = factors.get(item.metal)
        if not factor:
            raise HTTPException(status_code=400, detail=f"Unbekanntes Metall: {item.metal}")
        cond_factor = condition_factors.get(item.condition, 1.0) if item.condition else 1.0
        material = material_factors.get(item.base_material)
        mat_factor = material["factor"] if material else 1.0
        fin_factor = finish_factors.get(item.finish, 1.0) if item.finish else 1.0
        unit = round(product["base_price_eur"] * factor * cond_factor * mat_factor * fin_factor, 2)
        line_total = round(unit * item.quantity, 2)
        total = round(total + line_total, 2)
        lines.append({
            "product_id": item.product_id,
            "product_name": product["name"],
            "metal": item.metal,
            "finish": item.finish,
            "finish_name": item.finish_name,
            "condition": item.condition,
            "base_material": material["name"] if material else item.base_material,
            "quantity": item.quantity,
            "unit_price_eur": unit,
            "line_total_eur": line_total,
        })
    if total <= 0:
        raise HTTPException(status_code=400, detail="Gesamtsumme muss größer als 0 sein")

    order_id = str(uuid.uuid4())
    doc = {
        "id": order_id,
        "order_type": "cart_order",
        "name": request.name,
        "email": request.email,
        "phone": request.phone,
        "description": request.note,
        "items": lines,
        "status": "new",
        "payment_status": "pending",
        "payment_amount_eur": total,
        "action_token": secrets.token_urlsafe(24),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.configurator_orders.insert_one(doc)

    rows = "".join(
        f"""<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">{l['product_name']}<br>
              <span style="color:#94a3b8;font-size:12px;">{l['metal']}{' · ' + (l.get('finish_name') or l['finish']) if l.get('finish') else ''}{' · ' + l['base_material'] if l.get('base_material') else ''}{' · Zustand: ' + l['condition'] if l.get('condition') else ''}</span></td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">{l['quantity']}×</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;">{l['line_total_eur']:.2f} €</td>
        </tr>"""
        for l in lines
    )
    items_table = f"""
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
      <tr>
        <th style="text-align:left;padding:8px 12px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Position</th>
        <th style="text-align:center;padding:8px 12px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Menge</th>
        <th style="text-align:right;padding:8px 12px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Preis</th>
      </tr>
      {rows}
      <tr>
        <td colspan="2" style="padding:12px;font-weight:bold;">Gesamtsumme</td>
        <td style="padding:12px;text-align:right;font-weight:bold;white-space:nowrap;">{total:.2f} €</td>
      </tr>
    </table>
    """

    await send_email_via_resend(
        to_email=request.email,
        subject="Kathodik – Ihre Bestellung ist eingegangen",
        html_content=f"""
        <h2 style="margin:0 0 8px;color:#1e293b;">Vielen Dank für Ihre Bestellung, {request.name}!</h2>
        <p>Wir haben Ihre Bestellung erhalten. Nach Zahlungseingang senden wir Ihnen Ihr
        vorfrankiertes Versandlabel per E-Mail – damit schicken Sie uns Ihre Stücke bequem zu.</p>
        {items_table}
        <p style="color:#64748b;font-size:13px;">Auftragsnummer: {order_id}<br>
        Die finale Annahme erfolgt nach Prüfung der eingesandten Teile.</p>
        <p>Mit freundlichen Grüßen<br><strong>Ihr Kathodik-Team</strong></p>
        """
    )
    await send_email_via_resend(
        to_email="service@kathodik.com",
        subject=f"Neue Warenkorb-Bestellung von {request.name} ({total:.2f} €)",
        html_content=f"""
        <h2 style="margin:0 0 8px;color:#1e293b;">Neue Warenkorb-Bestellung</h2>
        <p><strong>Name:</strong> {request.name}<br>
        <strong>E-Mail:</strong> {request.email}<br>
        <strong>Telefon:</strong> {request.phone or 'Nicht angegeben'}</p>
        {items_table}
        {_order_action_buttons(order_id, doc['action_token'])}
        <p style="color:#64748b;font-size:13px;">Auftragsnummer: {order_id} · Zahlung: ausstehend (PayPal)</p>
        """
    )

    return {"id": order_id, "total_eur": total, "items": lines}

# ─── Waitlist Endpoints (Notification Signup) ───
class WaitlistEntry(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class WaitlistResponse(BaseModel):
    message: str
    email: str

@api_router.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(entry: WaitlistEntry):
    """Sign up for notification when orders reopen"""
    existing = await db.waitlist.find_one({"email": entry.email})
    if existing:
        return WaitlistResponse(message="Sie sind bereits auf der Warteliste", email=entry.email)
    
    await db.waitlist.insert_one({
        "email": entry.email,
        "name": entry.name,
        "notified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return WaitlistResponse(message="Sie werden benachrichtigt, sobald wir wieder Aufträge annehmen", email=entry.email)

@api_router.get("/waitlist")
async def get_waitlist(current_user: User = Depends(get_current_user)):
    """Get waitlist entries (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    entries = await db.waitlist.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return entries

# ─── Saved Requests (for paused state) ───
class SavedRequestCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    metal: Optional[str] = None
    finish: Optional[str] = None
    quantity: Optional[int] = None
    message: Optional[str] = None
    notify_when_open: bool = False

class SavedRequestResponse(BaseModel):
    id: str
    message: str

@api_router.post("/saved-requests", response_model=SavedRequestResponse)
async def create_saved_request(request: SavedRequestCreate):
    """Save a customer request for later (when orders are paused)"""
    request_id = str(uuid.uuid4())
    doc = {
        "id": request_id,
        **request.dict(),
        "status": "saved",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.saved_requests.insert_one(doc)
    
    # If user wants notification, add to waitlist
    if request.notify_when_open:
        existing = await db.waitlist.find_one({"email": request.email})
        if not existing:
            await db.waitlist.insert_one({
                "email": request.email,
                "name": request.name,
                "notified": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

    # Notify admin about new saved request
    await send_email_via_resend(
        to_email="service@kathodik.com",
        subject=f"Neue gespeicherte Anfrage von {request.name}",
        html_content=f"""
        <h2>Neue gespeicherte Anfrage (Auftragsannahme pausiert)</h2>
        <p><strong>Name:</strong> {request.name}</p>
        <p><strong>E-Mail:</strong> {request.email}</p>
        <p><strong>Telefon:</strong> {request.phone or 'Nicht angegeben'}</p>
        <p><strong>Nachricht:</strong></p>
        <p>{request.message or 'Keine Details'}</p>
        <p><strong>Benachrichtigen bei Wiederöffnung:</strong> {'Ja' if request.notify_when_open else 'Nein'}</p>
        <hr>
        <p><strong>Anfrage-ID:</strong> {request_id}</p>
        """
    )

    # Confirm to customer
    await send_email_via_resend(
        to_email=request.email,
        subject="Kathodik - Ihre Anfrage wurde gespeichert",
        html_content=f"""
        <h2>Vielen Dank, {request.name}!</h2>
        <p>Wir können aktuell aufgrund hoher Auslastung keine neuen Aufträge annehmen –
        Ihre Anfrage wurde aber sicher bei uns gespeichert.</p>
        {'<p>Wir benachrichtigen Sie automatisch per E-Mail, sobald wir wieder Aufträge annehmen.</p>' if request.notify_when_open else ''}
        <br>
        <p>Mit freundlichen Grüßen,</p>
        <p><strong>Kathodik - Galvanotechnik</strong><br>Hannes Barfuß</p>
        """
    )

    return SavedRequestResponse(id=request_id, message="Anfrage gespeichert")

@api_router.get("/saved-requests")
async def get_saved_requests(email: Optional[str] = None, current_user: User = Depends(get_current_user)):
    """Get saved requests - own or all (admin)"""
    if current_user.is_admin and not email:
        query = {}
    else:
        query = {"email": email or current_user.email}
    requests = await db.saved_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return requests

# ─── 3D Configurator Endpoints ───
class ConceptImageRequest(BaseModel):
    description: str
    metal: Optional[str] = None
    finish: Optional[str] = None
    reference_image: Optional[str] = None  # base64 encoded

class ConfiguratorOrderRequest(BaseModel):
    order_type: str  # "upload", "partner_model", "ai_generate", "mobile_service", "metal_order"
    name: str
    email: EmailStr
    phone: Optional[str] = None
    description: Optional[str] = None
    metal: Optional[str] = None
    finish: Optional[str] = None
    quantity: Optional[str] = None
    base_material: Optional[str] = None
    condition: Optional[str] = None
    file_data: Optional[str] = None  # base64 encoded file for upload path
    file_name: Optional[str] = None
    concept_image: Optional[str] = None  # base64 of AI generated concept
    reference_image: Optional[str] = None  # base64 of user reference image
    images: Optional[List[str]] = None  # base64 list of user-uploaded part photos

@api_router.post("/configurator/generate-concept")
async def generate_concept(request: ConceptImageRequest):
    """Generate a photorealistic concept image from description"""
    try:
        # Build a detailed prompt for photorealistic output
        metal_desc = f"mit {request.metal}-Beschichtung" if request.metal else ""
        finish_desc = f"in {request.finish}-Ausführung" if request.finish else ""
        
        prompt = (
            f"Photorealistic product photograph, studio lighting, white background, "
            f"high detail 3D printed object: {request.description} "
            f"{metal_desc} {finish_desc}. "
            f"Professional product photography, sharp focus, metallic surface reflections, "
            f"clean industrial design, octane render quality."
        )
        
        image_base64 = await generate_concept_image(prompt)
        
        return {"image_base64": image_base64, "prompt_used": prompt}
    except Exception as e:
        logger.error(f"Concept generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bildgenerierung fehlgeschlagen: {str(e)}")

@api_router.post("/configurator/order")
async def create_configurator_order(request: ConfiguratorOrderRequest):
    """Create a 3D configurator order"""
    order_id = str(uuid.uuid4())
    
    doc = {
        "id": order_id,
        "order_type": request.order_type,
        "name": request.name,
        "email": request.email,
        "phone": request.phone,
        "description": request.description,
        "metal": request.metal,
        "finish": request.finish,
        "quantity": request.quantity,
        "base_material": request.base_material,
        "condition": request.condition,
        "file_name": request.file_name,
        "has_file": request.file_data is not None,
        "has_concept_image": request.concept_image is not None,
        "has_reference_image": request.reference_image is not None,
        "image_count": len(request.images) if request.images else 0,
        "status": "new",
        "action_token": secrets.token_urlsafe(24),
        "payment_status": "pending" if request.order_type == "metal_order" else "not_applicable",
        "payment_amount_eur": 49 if request.order_type == "metal_order" else 0,
        "shopify_checkout_id": None,
        "shopify_order_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Store file data separately to keep order doc lean
    if request.file_data:
        await db.configurator_files.insert_one({
            "order_id": order_id,
            "file_data": request.file_data,
            "file_name": request.file_name,
            "type": "upload"
        })
    if request.concept_image:
        await db.configurator_files.insert_one({
            "order_id": order_id,
            "file_data": request.concept_image,
            "file_name": "concept.png",
            "type": "concept"
        })
    if request.reference_image:
        await db.configurator_files.insert_one({
            "order_id": order_id,
            "file_data": request.reference_image,
            "file_name": "reference.png",
            "type": "reference"
        })
    if request.images:
        for i, img in enumerate(request.images):
            await db.configurator_files.insert_one({
                "order_id": order_id,
                "file_data": img,
                "file_name": f"part_image_{i+1}.png",
                "type": "part_image"
            })

    await db.configurator_orders.insert_one(doc)
    
    # Build order type label
    type_labels = {
        "upload": "Eigene Datei hochgeladen",
        "partner_model": "Modellierung durch Partner",
        "ai_generate": "KI-generiertes Konzept",
        "mobile_service": "Mobile Dienstleistung (Vor-Ort)",
        "metal_order": "Metall-Beschichtungsauftrag"
    }
    type_label = type_labels.get(request.order_type, request.order_type)

    condition_labels = {
        "neu": "Stufe 1: Neu / Neuwertig",
        "leicht": "Stufe 2: Leicht oxidiert / Kratzer",
        "stark": "Stufe 3: Starker Rost / Tiefenkratzer",
    }
    condition_label = condition_labels.get(request.condition, request.condition or "Nicht angegeben")
    
    # Bauteilfotos als echte Anhänge für die Admin-Mail aufbereiten
    def _data_url_to_attachment(data_url: str, filename: str):
        if not data_url:
            return None
        b64 = data_url.split(",", 1)[1] if data_url.startswith("data:") else data_url
        return {"filename": filename, "content": b64}

    admin_attachments = []
    if request.images:
        for i, img in enumerate(request.images):
            att = _data_url_to_attachment(img, f"bauteilfoto_{i+1}.jpg")
            if att:
                admin_attachments.append(att)
    if request.reference_image:
        att = _data_url_to_attachment(request.reference_image, "referenzbild.png")
        if att:
            admin_attachments.append(att)

    # Notify admin
    await send_email_via_resend(
        to_email="service@kathodik.com",
        subject=f"Neuer Auftrag ({type_label}) von {request.name}",
        attachments=admin_attachments or None,
        html_content=f"""
        <h2>Neuer Auftrag</h2>
        <p><strong>Auftragstyp:</strong> {type_label}</p>
        <p><strong>Name:</strong> {request.name}</p>
        <p><strong>E-Mail:</strong> {request.email}</p>
        <p><strong>Telefon:</strong> {request.phone or 'Nicht angegeben'}</p>
        <p><strong>Metall:</strong> {request.metal or 'Nicht angegeben'}</p>
        <p><strong>Finish:</strong> {request.finish or 'Nicht angegeben'}</p>
        <p><strong>Stückzahl:</strong> {request.quantity or 'Nicht angegeben'}</p>
        <p><strong>Grundmaterial:</strong> {request.base_material or 'Nicht angegeben'}</p>
        <p><strong>Zustand:</strong> {condition_label}</p>
        <p><strong>Beschreibung:</strong></p>
        <p>{request.description or 'Keine Beschreibung'}</p>
        <p><strong>Bilder:</strong> {doc['image_count']} Bauteilfoto(s) angehängt</p>
        <p><strong>Datei hochgeladen:</strong> {'Ja - ' + (request.file_name or '') if request.file_data else 'Nein'}</p>
        {_order_action_buttons(order_id, doc['action_token'])}
        <hr>
        <p><strong>Auftrags-ID:</strong> {order_id}</p>
        """
    )
    
    # Confirm to customer
    await send_email_via_resend(
        to_email=request.email,
        subject=f"Kathodik – Ihr Auftrag ist eingegangen ({type_label})",
        html_content=f"""
        <h2 style="margin:0 0 8px;color:#1e293b;">Vielen Dank für Ihren Auftrag!</h2>
        <p>Wir haben Ihren Auftrag erhalten und werden uns zeitnah bei Ihnen melden.</p>
        <p><strong>Auftragstyp:</strong> {type_label}</p>
        <p><strong>Auftrags-ID:</strong> {order_id}</p>
        {f'<p><strong>Beschreibung:</strong> {request.description}</p>' if request.description else ''}
        <br>
        <p>Mit freundlichen Grüßen,</p>
        <p><strong>Kathodik - Galvanotechnik</strong></p>
        """
    )
    
    return {"id": order_id, "message": "Auftrag erfolgreich erstellt", "order_type": request.order_type}

# ─── Auftragsstatus: Bestätigen/Ablehnen/Fortschritt + Kundenbenachrichtigung ───
ORDER_STATUSES = {
    "new": "Neu",
    "confirmed": "Bestätigt",
    "declined": "Abgelehnt",
    "in_progress": "In Arbeit",
    "completed": "Abgeschlossen",
}

async def _apply_order_status(order: dict, new_status: str, notify_customer: bool = True):
    await db.configurator_orders.update_one(
        {"id": order["id"]},
        {"$set": {"status": new_status, "status_updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if not notify_customer or not order.get("email"):
        return
    subjects = {
        "confirmed": "Kathodik – Ihr Auftrag wurde bestätigt ✔",
        "declined": "Kathodik – Rückmeldung zu Ihrem Auftrag",
        "in_progress": "Kathodik – Ihr Auftrag ist in Arbeit",
        "completed": "Kathodik – Ihr Auftrag ist abgeschlossen",
    }
    bodies = {
        "confirmed": f"""
            <h2 style="margin:0 0 8px;color:#1e293b;">Gute Nachrichten, {order.get('name', '')}!</h2>
            <p>Wir haben Ihren Auftrag geprüft und <strong>bestätigt</strong>.
            Falls noch nicht geschehen, senden Sie uns Ihre Stücke bitte mit dem Versandlabel zu –
            wir legen los, sobald sie bei uns eintreffen.</p>
            <p style="color:#64748b;font-size:13px;">Auftragsnummer: {order['id']}</p>
            <p>Mit freundlichen Grüßen<br><strong>Ihr Kathodik-Team</strong></p>""",
        "declined": f"""
            <h2 style="margin:0 0 8px;color:#1e293b;">Rückmeldung zu Ihrem Auftrag</h2>
            <p>Leider können wir Ihren Auftrag in dieser Form nicht annehmen.
            Bereits geleistete Zahlungen erstatten wir selbstverständlich zurück.</p>
            <p>Gern finden wir gemeinsam eine Alternative – antworten Sie einfach auf diese E-Mail
            oder rufen Sie uns an.</p>
            <p style="color:#64748b;font-size:13px;">Auftragsnummer: {order['id']}</p>
            <p>Mit freundlichen Grüßen<br><strong>Ihr Kathodik-Team</strong></p>""",
        "in_progress": f"""
            <h2 style="margin:0 0 8px;color:#1e293b;">Es geht los!</h2>
            <p>Ihre Stücke sind bei uns eingetroffen und werden jetzt veredelt.
            Wir melden uns, sobald der Auftrag abgeschlossen ist.</p>
            <p style="color:#64748b;font-size:13px;">Auftragsnummer: {order['id']}</p>
            <p>Mit freundlichen Grüßen<br><strong>Ihr Kathodik-Team</strong></p>""",
        "completed": f"""
            <h2 style="margin:0 0 8px;color:#1e293b;">Fertig! ✨</h2>
            <p>Ihr Auftrag ist abgeschlossen – Ihre veredelten Stücke machen sich auf den Rückweg zu Ihnen.</p>
            <p>Wir würden uns freuen, wenn Sie uns nach Erhalt eine Rückmeldung geben.</p>
            <p style="color:#64748b;font-size:13px;">Auftragsnummer: {order['id']}</p>
            <p>Mit freundlichen Grüßen<br><strong>Ihr Kathodik-Team</strong></p>""",
    }
    if new_status in subjects:
        await send_email_via_resend(order["email"], subjects[new_status], bodies[new_status])

class OrderStatusUpdate(BaseModel):
    status: str

@api_router.put("/configurator/orders/{order_id}/status")
async def update_order_status(order_id: str, update: OrderStatusUpdate, current_user: User = Depends(get_current_user)):
    """Update order status (admin only); notifies the customer by email."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    if update.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Ungültiger Status")
    order = await db.configurator_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Auftrag nicht gefunden")
    await _apply_order_status(order, update.status)
    return {"id": order_id, "status": update.status}

def _action_page(title: str, text: str, color: str = "#2c7a7b") -> HTMLResponse:
    return HTMLResponse(f"""
        <html><head><meta charset="utf-8"><title>{title}</title></head>
        <body style="font-family:-apple-system,sans-serif;background:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="background:white;border-radius:16px;padding:40px;max-width:420px;text-align:center;border-top:5px solid {color};">
            <h2 style="color:#1e293b;margin:0 0 12px;">{title}</h2>
            <p style="color:#475569;">{text}</p>
          </div>
        </body></html>""")

@api_router.get("/orders/{order_id}/action")
async def order_action_via_email(order_id: str, token: str, action: str):
    """One-click confirm/decline from the admin notification email (token-protected)."""
    order = await db.configurator_orders.find_one({"id": order_id}, {"_id": 0})
    if not order or not order.get("action_token") or order["action_token"] != token:
        return _action_page("Link ungültig", "Dieser Aktionslink ist ungültig oder abgelaufen.", "#dc2626")
    if action not in ("confirm", "decline"):
        return _action_page("Unbekannte Aktion", "Diese Aktion wird nicht unterstützt.", "#dc2626")
    new_status = "confirmed" if action == "confirm" else "declined"
    if order.get("status") == new_status:
        return _action_page("Bereits erledigt", f"Der Auftrag ist bereits als „{ORDER_STATUSES[new_status]}“ markiert.")
    await _apply_order_status(order, new_status)
    label = ORDER_STATUSES[new_status]
    return _action_page(f"Auftrag {label.lower()}", f"Der Auftrag von {order.get('name', '')} wurde als „{label}“ markiert. Der Kunde wurde per E-Mail informiert.")

@api_router.get("/configurator/orders/{order_id}/files")
async def get_configurator_order_files(order_id: str, current_user: User = Depends(get_current_user)):
    """Get the stored files/images of an order (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    files = await db.configurator_files.find(
        {"order_id": order_id}, {"_id": 0}
    ).to_list(50)
    return {"order_id": order_id, "files": files}

@api_router.get("/configurator/orders")
async def get_configurator_orders(current_user: User = Depends(get_current_user)):
    """Get configurator orders (admin: all, user: own)"""
    if current_user.is_admin:
        query = {}
    else:
        query = {"email": current_user.email}
    orders = await db.configurator_orders.find(query, {"_id": 0, "action_token": 0}).sort("created_at", -1).to_list(100)
    return orders

# ─── Analytics Tracking ───
class PageViewEvent(BaseModel):
    page: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    visitor_id: Optional[str] = None

@api_router.post("/analytics/pageview")
async def track_pageview(event: PageViewEvent):
    """Track a page view (called from frontend)"""
    await db.analytics.insert_one({
        "type": "pageview",
        "page": event.page,
        "referrer": event.referrer,
        "user_agent": event.user_agent,
        "visitor_id": event.visitor_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    return {"status": "ok"}

@api_router.get("/analytics/stats")
async def get_analytics_stats(current_user: User = Depends(get_current_user)):
    """Get analytics statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()
    
    # Total page views
    total_views = await db.analytics.count_documents({"type": "pageview"})
    today_views = await db.analytics.count_documents({"type": "pageview", "timestamp": {"$gte": today_start}})
    week_views = await db.analytics.count_documents({"type": "pageview", "timestamp": {"$gte": week_ago}})
    month_views = await db.analytics.count_documents({"type": "pageview", "timestamp": {"$gte": month_ago}})
    
    # Unique visitors (by visitor_id)
    unique_today = len(await db.analytics.distinct("visitor_id", {"type": "pageview", "timestamp": {"$gte": today_start}}))
    unique_week = len(await db.analytics.distinct("visitor_id", {"type": "pageview", "timestamp": {"$gte": week_ago}}))
    unique_month = len(await db.analytics.distinct("visitor_id", {"type": "pageview", "timestamp": {"$gte": month_ago}}))
    
    # Top pages (last 30 days)
    pipeline_pages = [
        {"$match": {"type": "pageview", "timestamp": {"$gte": month_ago}}},
        {"$group": {"_id": "$page", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_pages = await db.analytics.aggregate(pipeline_pages).to_list(10)
    
    # Daily views (last 7 days)
    daily_views = []
    for i in range(7):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        day_end = (day.replace(hour=23, minute=59, second=59, microsecond=999999)).isoformat()
        count = await db.analytics.count_documents({
            "type": "pageview",
            "timestamp": {"$gte": day_start, "$lte": day_end}
        })
        daily_views.append({
            "date": day.strftime("%d.%m"),
            "views": count
        })
    daily_views.reverse()
    
    # Cookie consent stats
    cookies_accepted = await db.analytics.count_documents({"type": "cookie_consent", "accepted": True})
    cookies_declined = await db.analytics.count_documents({"type": "cookie_consent", "accepted": False})
    
    return {
        "total_views": total_views,
        "today_views": today_views,
        "week_views": week_views,
        "month_views": month_views,
        "unique_today": unique_today,
        "unique_week": unique_week,
        "unique_month": unique_month,
        "top_pages": [{"page": p["_id"], "count": p["count"]} for p in top_pages],
        "daily_views": daily_views,
        "cookies_accepted": cookies_accepted,
        "cookies_declined": cookies_declined
    }

@api_router.post("/analytics/cookie-consent")
async def track_cookie_consent(accepted: bool = True, visitor_id: str = None):
    """Track cookie consent decision"""
    await db.analytics.insert_one({
        "type": "cookie_consent",
        "accepted": accepted,
        "visitor_id": visitor_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    return {"status": "ok"}

# ---------- Background removal (rembg) ----------
_rembg_session = None

def _get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        from rembg import new_session
        _rembg_session = new_session("u2netp")  # small/fast model
    return _rembg_session

@api_router.post("/coating/remove-background")
async def remove_bg(file: UploadFile = File(...)):
    """Remove image background using rembg. Returns base64-encoded transparent PNG."""
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Bitte ein Bild hochladen")
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Bild zu groß (max. 10 MB)")
        from rembg import remove
        out = await asyncio.to_thread(remove, content, session=_get_rembg_session())
        return {"image_base64": base64.b64encode(out).decode("utf-8")}
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("rembg failed")
        raise HTTPException(status_code=500, detail=f"Freistellen fehlgeschlagen: {str(e)}")

# ---------- PayPal Express Checkout ----------
PAYPAL_API_URLS = {
    "sandbox": "https://api-m.sandbox.paypal.com",
    "live": "https://api-m.paypal.com",
}
_paypal_token_cache = {"token": None, "expires_at": 0}

async def _paypal_access_token():
    """Get (and cache) a PayPal OAuth access token."""
    import time, httpx
    now = time.time()
    if _paypal_token_cache["token"] and _paypal_token_cache["expires_at"] - 30 > now:
        return _paypal_token_cache["token"]
    client_id = os.environ.get("PAYPAL_CLIENT_ID")
    client_secret = os.environ.get("PAYPAL_CLIENT_SECRET")
    mode = os.environ.get("PAYPAL_MODE", "sandbox").lower()
    if not (client_id and client_secret):
        raise HTTPException(status_code=500, detail="PayPal credentials not configured")
    base = PAYPAL_API_URLS.get(mode, PAYPAL_API_URLS["sandbox"])
    async with httpx.AsyncClient(timeout=20.0) as http:
        r = await http.post(
            f"{base}/v1/oauth2/token",
            auth=(client_id, client_secret),
            data={"grant_type": "client_credentials"},
            headers={"Accept": "application/json"},
        )
        if r.status_code != 200:
            logger.error(f"PayPal auth failed: {r.status_code} {r.text[:200]}")
            raise HTTPException(status_code=502, detail="PayPal authentication failed")
        data = r.json()
        _paypal_token_cache["token"] = data["access_token"]
        _paypal_token_cache["expires_at"] = now + data.get("expires_in", 3000)
        return data["access_token"]

def _paypal_base_url():
    return PAYPAL_API_URLS.get(os.environ.get("PAYPAL_MODE", "sandbox").lower(), PAYPAL_API_URLS["sandbox"])

class PayPalCreateOrderRequest(BaseModel):
    internal_order_id: Optional[str] = None  # links PayPal payment to our configurator_order
    amount_eur: float = 49.0

@api_router.post("/paypal/orders")
async def paypal_create_order(req: PayPalCreateOrderRequest):
    """Create a PayPal order. The amount is taken from the linked internal order
    (server-side computed) when available, so clients cannot tamper with it."""
    import httpx
    amount = req.amount_eur
    description = "Kathodik - Einsende-Pauschale & Versand-Label"
    if req.internal_order_id:
        internal = await db.configurator_orders.find_one({"id": req.internal_order_id}, {"_id": 0})
        if internal and internal.get("payment_amount_eur", 0) > 0:
            amount = float(internal["payment_amount_eur"])
            if internal.get("order_type") == "cart_order":
                description = "Kathodik - Galvanisierungsauftrag (Warenkorb)"
    token = await _paypal_access_token()
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {"currency_code": "EUR", "value": f"{amount:.2f}"},
            "description": description,
            "custom_id": req.internal_order_id or "",
        }],
        "application_context": {
            "brand_name": "Kathodik – Galvanotechnik",
            "user_action": "PAY_NOW",
            "shipping_preference": "NO_SHIPPING",
        },
    }
    async with httpx.AsyncClient(timeout=30.0) as http:
        r = await http.post(
            f"{_paypal_base_url()}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            json=payload,
        )
        if r.status_code not in (200, 201):
            logger.error(f"PayPal create order failed: {r.status_code} {r.text[:400]}")
            raise HTTPException(status_code=502, detail="PayPal order creation failed")
        data = r.json()
        # Link to our internal order if provided
        if req.internal_order_id:
            await db.configurator_orders.update_one(
                {"id": req.internal_order_id},
                {"$set": {"paypal_order_id": data["id"], "payment_provider": "paypal"}}
            )
        return {"id": data["id"], "status": data.get("status")}

@api_router.post("/paypal/orders/{order_id}/capture")
async def paypal_capture_order(order_id: str):
    """Capture an approved PayPal order; mark internal order as paid."""
    import httpx
    token = await _paypal_access_token()
    async with httpx.AsyncClient(timeout=30.0) as http:
        r = await http.post(
            f"{_paypal_base_url()}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
        )
        if r.status_code not in (200, 201):
            logger.error(f"PayPal capture failed: {r.status_code} {r.text[:400]}")
            try:
                return JSONResponse(status_code=r.status_code, content=r.json())
            except Exception:
                raise HTTPException(status_code=502, detail="PayPal capture failed")
        data = r.json()
        # Find our internal order via custom_id stored at creation time
        try:
            pu = data.get("purchase_units", [{}])[0]
            capture = pu.get("payments", {}).get("captures", [{}])[0]
            internal_id = pu.get("custom_id") or pu.get("payments", {}).get("captures", [{}])[0].get("custom_id")
            if internal_id:
                await db.configurator_orders.update_one(
                    {"id": internal_id},
                    {"$set": {
                        "payment_status": "paid",
                        "paypal_capture_id": capture.get("id"),
                        "paid_at": datetime.now(timezone.utc).isoformat(),
                    }}
                )
                # Notify admin
                order_doc = await db.configurator_orders.find_one({"id": internal_id}, {"_id": 0})
                if order_doc:
                    await send_email_via_resend(
                        to_email="service@kathodik.com",
                        subject=f"49 EUR bezahlt von {order_doc.get('name')} - Auftrag {internal_id[:8]}",
                        html_content=f"""
                        <h2>Einsende-Pauschale wurde bezahlt</h2>
                        <p><strong>Kunde:</strong> {order_doc.get('name')} ({order_doc.get('email')})</p>
                        <p><strong>Auftrag:</strong> {order_doc.get('metal')} - {order_doc.get('finish')} ({order_doc.get('quantity')} Stk)</p>
                        <p><strong>PayPal Capture ID:</strong> {capture.get('id')}</p>
                        <p><strong>Betrag:</strong> {capture.get('amount', {}).get('value')} {capture.get('amount', {}).get('currency_code')}</p>
                        <p><strong>Auftrags-ID:</strong> {internal_id}</p>
                        """
                    )
        except Exception as e:
            logger.warning(f"PayPal capture post-processing failed: {e}")
        return data

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ─── Zahlungserinnerung: unbezahlte Bestellungen nach 24h einmalig erinnern ───
async def _payment_reminder_loop():
    while True:
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            orders = await db.configurator_orders.find({
                "payment_status": "pending",
                "reminder_sent": {"$ne": True},
                "order_type": {"$in": ["metal_order", "cart_order"]},
                "created_at": {"$lt": cutoff},
            }, {"_id": 0}).to_list(100)
            for o in orders:
                amount = o.get("payment_amount_eur", 0)
                items_html = ""
                if o.get("items"):
                    items_html = "".join(
                        f"<p style='margin:2px 0;color:#64748b;font-size:14px;'>{l['quantity']}× {l['product_name']} · {l['metal']} — {l['line_total_eur']:.2f} €</p>"
                        for l in o["items"]
                    )
                await send_email_via_resend(
                    to_email=o["email"],
                    subject="Kathodik – Ihre Bestellung wartet noch auf die Zahlung",
                    html_content=f"""
                    <h2 style="margin:0 0 8px;color:#1e293b;">Fast geschafft, {o.get('name', '')}!</h2>
                    <p>Ihre Bestellung vom {o.get('created_at', '')[:10]} ist bei uns eingegangen,
                    die Zahlung über <strong>{amount:.2f} €</strong> steht aber noch aus.</p>
                    {items_html}
                    <p>Besuchen Sie einfach erneut
                    <a href="https://kathodik.de/services" style="color:#2c7a7b;font-weight:bold;">kathodik.de/services</a>,
                    um die Bestellung abzuschließen – oder antworten Sie auf diese E-Mail, dann helfen wir Ihnen weiter.</p>
                    <p style="color:#94a3b8;font-size:12px;">Falls Sie bereits bezahlt haben oder die Bestellung nicht mehr
                    wünschen, können Sie diese Nachricht ignorieren. (Auftragsnummer: {o['id']})</p>
                    <p>Mit freundlichen Grüßen<br><strong>Ihr Kathodik-Team</strong></p>
                    """
                )
                await db.configurator_orders.update_one(
                    {"id": o["id"]},
                    {"$set": {"reminder_sent": True, "reminder_sent_at": datetime.now(timezone.utc).isoformat()}}
                )
                logger.info(f"Payment reminder sent for order {o['id']}")
        except Exception as e:
            logger.error(f"Payment reminder loop error: {e}")
        await asyncio.sleep(6 * 3600)

@app.on_event("startup")
async def start_payment_reminder_loop():
    asyncio.create_task(_payment_reminder_loop())

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()