from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

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
class LoginData(BaseModel):
    email: str
    password: str
    


@app.post("/login")
def login(data: LoginData):
    # Add your login logic here
    print(f"Received login data: {data.email}, {data.password}")
    return{"message": "Login successful"}

app.mount("/styles", StaticFiles(directory="styles"), name="styles")
app.mount("/img", StaticFiles(directory="img"), name="img")   
app.mount("/", StaticFiles(directory="."), name="static")
