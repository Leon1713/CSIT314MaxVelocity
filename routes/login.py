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
    result = controller.authLogin(data.email, data.password, data.role)
    if isinstance(result, Account) and result:
        session : Session = controller.getCurrentSession(req)
        if not session:
            session = controller.createNewSession(result,req,res)
            
        res = JSONResponse(
            content={   "success" : True,
                "session_id" : session.session_id,
                "user_id" : session.user_id,
                "message" : "Login Successful"
            }
        )
        res.set_cookie(
            key="session_token",
            value=session.session_id,
            httponly=True,
            samesite="lax",
            secure=False #test only
        )   
    else:
        res = JSONResponse(
            content={"error" : "Invalid email/username or password"}
        )
    return res