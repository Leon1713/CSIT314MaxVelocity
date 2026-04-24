from fastapi import APIRouter
from pydantic import BaseModel
from Controller.signupController import signupController
class signUpData(BaseModel):
    username: str
    email: str
    password: str
    role: str
    

router = APIRouter();
@router.post("/signup")
def signup(data: signUpData):
    controller = signupController()
    return controller.signupUser(data.email,data.username, data.password, data.role)
    
    
    
    