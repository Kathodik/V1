from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
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

class ContactFormResponse(BaseModel):
    id: str
    message: str

# Resend email helper
async def send_email_via_resend(to_email: str, subject: str, html_content: str):
    """Send email using Resend API (non-blocking)"""
    resend_key = os.environ.get('RESEND_API_KEY')
    sender = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
    if not resend_key:
        logger.warning("RESEND_API_KEY not set, skipping email send")
        return None
    try:
        import resend
        resend.api_key = resend_key
        params = {
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to_email}: {result}")
        return result
    except Exception as e:
        logger.error(f"Email send failed: {e}")
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
    """Submit a contact form message"""
    contact_id = str(uuid.uuid4())
    doc = {
        "id": contact_id,
        "name": form.name,
        "email": form.email,
        "phone": form.phone,
        "message": form.message,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(doc)

    # Send notification email to company
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
        """
    )

    # Send confirmation email to customer
    await send_email_via_resend(
        to_email=form.email,
        subject="Kathodik - Ihre Anfrage wurde empfangen",
        html_content=f"""
        <h2>Vielen Dank fuer Ihre Nachricht, {form.name}!</h2>
        <p>Wir haben Ihre Anfrage erhalten und werden uns in Kuerze bei Ihnen melden.</p>
        <br>
        <p>Mit freundlichen Gruessen,</p>
        <p><strong>Kathodik - Galvanotechnik</strong></p>
        <p>Inhaber: Hannes Barfuss</p>
        """
    )

    return ContactFormResponse(
        id=contact_id,
        message="Nachricht erfolgreich gesendet"
    )

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
    order_type: str  # "upload", "partner_model", "ai_generate"
    name: str
    email: EmailStr
    phone: Optional[str] = None
    description: Optional[str] = None
    metal: Optional[str] = None
    finish: Optional[str] = None
    file_data: Optional[str] = None  # base64 encoded file for upload path
    file_name: Optional[str] = None
    concept_image: Optional[str] = None  # base64 of AI generated concept
    reference_image: Optional[str] = None  # base64 of user reference image

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
        "file_name": request.file_name,
        "has_file": request.file_data is not None,
        "has_concept_image": request.concept_image is not None,
        "has_reference_image": request.reference_image is not None,
        "status": "new",
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
    
    await db.configurator_orders.insert_one(doc)
    
    # Build order type label
    type_labels = {
        "upload": "Eigene Datei hochgeladen",
        "partner_model": "Modellierung durch Partner",
        "ai_generate": "KI-generiertes Konzept",
        "mobile_service": "Mobile Dienstleistung (Vor-Ort)"
    }
    type_label = type_labels.get(request.order_type, request.order_type)
    
    # Notify admin
    await send_email_via_resend(
        to_email="service@kathodik.com",
        subject=f"Neuer 3D-Konfigurator Auftrag von {request.name}",
        html_content=f"""
        <h2>Neuer 3D-Konfigurator Auftrag</h2>
        <p><strong>Auftragstyp:</strong> {type_label}</p>
        <p><strong>Name:</strong> {request.name}</p>
        <p><strong>E-Mail:</strong> {request.email}</p>
        <p><strong>Telefon:</strong> {request.phone or 'Nicht angegeben'}</p>
        <p><strong>Metall:</strong> {request.metal or 'Nicht angegeben'}</p>
        <p><strong>Beschreibung:</strong></p>
        <p>{request.description or 'Keine Beschreibung'}</p>
        <p><strong>Datei hochgeladen:</strong> {'Ja - ' + (request.file_name or '') if request.file_data else 'Nein'}</p>
        <p><strong>Auftrags-ID:</strong> {order_id}</p>
        """
    )
    
    # Confirm to customer
    await send_email_via_resend(
        to_email=request.email,
        subject="Kathodik - Ihr 3D-Konfigurator Auftrag",
        html_content=f"""
        <h2>Vielen Dank für Ihren Auftrag!</h2>
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

@api_router.get("/configurator/orders")
async def get_configurator_orders(current_user: User = Depends(get_current_user)):
    """Get configurator orders (admin: all, user: own)"""
    if current_user.is_admin:
        query = {}
    else:
        query = {"email": current_user.email}
    orders = await db.configurator_orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()