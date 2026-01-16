from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class ChatMessage(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ThreeDModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shape: str  # cube, sphere, cylinder, etc.
    dimensions: dict  # {width, height, depth} or {radius, height}
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
    status: str = "pending"  # pending, sent, confirmed, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrintRequestCreate(BaseModel):
    model_id: str
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
