from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class LoginData(BaseModel):
    email: str
    password: str
    
@app.post("/login")
def login(data: LoginData):
    # Add your login logic here
    print(f"Received login data: {data.email}, {data.password}")
    return{"email": data.email, "password": data.password}
