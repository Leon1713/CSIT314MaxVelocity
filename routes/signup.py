from typing import Annotated

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, StringConstraints, field_validator, EmailStr
import re
from Controller.signupController import signupController

NonEmptyString = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1)
]


class signUpData(BaseModel):
    first_name: NonEmptyString
    last_name: str
    username: NonEmptyString
    email: NonEmptyString
    password: NonEmptyString
    role: NonEmptyString
    phone: NonEmptyString

    @field_validator('password')
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail={
                                "type": "PASSWORD_ERROR", "msg": "Password must be at least 6 characters long"})
        if not re.search(r'[A-Z]', v):
            HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail={
                          "type": "PASSWORD_ERROR", "msg": 'Password must contain at least one uppercase letter'})
        if not re.search(r'[0-9]', v):
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail={
                                "type": "PASSWORD_ERROR", "msg": "Password must contain at least one number"})
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail={
                                "type": "PASSWORD_ERROR", "msg": "Password must contain at least one special character"})
        return v


router = APIRouter()


@router.post("/signup")
def signup(data: signUpData):
    controller = signupController()
    result = controller.signupUser(
        data.email, data.username, data.password, data.role,
        data.first_name, data.last_name, data.phone
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "User registered successfully"}
