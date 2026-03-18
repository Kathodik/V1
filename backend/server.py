from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from chat_service import chat_service
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
        to_email="Service@Kathodik.com",
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
    user_dict["is_admin"] = False
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