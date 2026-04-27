from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from Controller.LoginController import LoginController
from Entity.Account import Account
from Entity.Session import Session

from routes.signup import router as router_reg

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router_reg)

class LoginData(BaseModel):
    email: str
    password: str
    role: str
    
@app.post("/login")
def login(data: LoginData, req : Request, res : Response) -> dict:
    print(f"Received login data: {data.email}, {data.password}, {data.role}")
    controller = LoginController()
    result = controller.authLogin(data.email, data.password, data.role)
    if isinstance(result, Account):
        session : Session = controller.createNewSession(result, res, req)
        return {"success" : True,
                "session_id" : session.session_id,
                "user_id" : session.user_id,
                "message" : "Login Successful"
                }
    else:
        return {"error" : "Invalid email/username or password"}
    

app.mount("/styles", StaticFiles(directory="styles"), name="styles")
app.mount("/img", StaticFiles(directory="img"), name="img")   
app.mount("/pages", StaticFiles(directory="pages"), name="static")
