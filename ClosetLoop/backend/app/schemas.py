from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class RegisterIn(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str = ""

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    display_name: str | None = None
    avatar_url: str | None = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    display_name: str
    avatar_url: str
    created_at: datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class ClosetCreate(BaseModel):
    name: str
    category: str
    color: str = "neutral"
    size: str = "M"
    style: str = "casual"
    condition: str = "good"
    image_url: str = ""

class ClosetOut(ClosetCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int
    created_at: datetime

class OutfitRequest(BaseModel):
    occasion: str = "everyday"
    style: str = "casual"
    weather: str = "hot"

class ProductCreate(BaseModel):
    closet_item_id: int | None = None
    title: str
    description: str = ""
    price: float
    listing_type: str = "sale"
    image_url: str = ""

class ProductUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    status: str | None = None

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    seller_id: int
    closet_item_id: int | None
    title: str
    description: str
    price: float
    listing_type: str
    status: str
    image_url: str
    created_at: datetime

class OrderCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    buyer_id: int
    product_id: int
    quantity: int
    total_price: float
    status: str
    created_at: datetime
