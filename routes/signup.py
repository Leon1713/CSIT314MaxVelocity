from fastapi import APIRouter
from pydantic import BaseModel, field_validator, EmailStr
import re
from Controller.signupController import signupController

class signUpData(BaseModel):
    username: str
    email: str
    password: str
    role: str
    first_name: str
    last_name: str
    phone: str

    @field_validator('username', 'email', 'password', 'role', 'first_name', 'last_name', 'phone')
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v


router = APIRouter()

@router.post("/signup")
def signup(data: signUpData):
    controller = signupController()
    return controller.signupUser(
        data.email,
        data.username,
        data.password,
        data.role,
        data.first_name,
        data.last_name,
        data.phone
    )