from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from Controller.LoginController import LoginController
from Entity.Account import Account
from Entity.Session import Session

class LoginData(BaseModel):
    email: str
    password: str
    role: str


router = APIRouter()
@router.post("/login")
def login(data: LoginData, req : Request, res : Response) -> dict:
    print(f"Received login data: {data.email}, {data.password}, {data.role}")
    controller = LoginController()
    try:
        result = controller.Login(data.email, data.password, data.role, req.client.host)
        res = JSONResponse(
            content={  "success" : True,
                "session_id" : result.session_id,
                "user_id" : result.user_id,
                "role_id" : result.role_id,
                "message" : "Login Successful"
            }
        )
        res.set_cookie(
            key="token",
            value=result.session_id,
            httponly=True,
            samesite="lax",
            secure=False #test only
        )
        return res
    except Exception:   
        res = JSONResponse(
            content={"error" : "Invalid email/username or password"}
        )
    return res