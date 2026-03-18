from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
import uuid

class ChatMessage(BaseModel):
    session_id: str
    message: str
    image_data: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ThreeDModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shape: str
    dimensions: dict
    material: str
    finish: str
    quantity: int
    description: Optional[str] = None
    customer_email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ThreeDModelCreate(BaseModel):
    shape: str
    dimensions: dict
    material: str
    finish: str
    quantity: int
    description: Optional[str] = None
    customer_email: str

class PrintRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    model_id: str
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrintRequestCreate(BaseModel):
    model_id: str
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    notes: Optional[str] = None

# User and Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Order Models
class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_email: str
    customer_name: str
    metal: str
    finish: str
    quantity: int
    description: Optional[str] = None
    status: str = "pending"  # pending, processing, completed, shipped
    images: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    customer_email: str
    customer_name: str
    metal: str
    finish: str
    quantity: int
    description: Optional[str] = None
    images: List[str] = []

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
