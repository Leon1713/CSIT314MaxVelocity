from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from Controller.LoginController import LoginController
from Entity.Account import Account

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
def login(data: LoginData) -> dict:
    print(f"Received login data: {data.email}, {data.password}, {data.role}")
    controller = LoginController()
    result = controller.authLogin(data.email, data.password, data.role)
    if isinstance(result, Account):
        return {"message" : "Login successful"}
    else:
        return {"error" : "Invalid email/username or password"}
    

app.mount("/styles", StaticFiles(directory="styles"), name="styles")
app.mount("/img", StaticFiles(directory="img"), name="img")   
app.mount("/pages", StaticFiles(directory="pages"), name="static")
