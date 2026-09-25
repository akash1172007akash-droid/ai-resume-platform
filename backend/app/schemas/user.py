from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
