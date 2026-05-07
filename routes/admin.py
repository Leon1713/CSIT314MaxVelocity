from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, StringConstraints
from Entity.Account import Account # for type hints
from ..Dependencies.Auth import get_current_users
from ..Controller.CreateUserAccountController import CreateUserAccountController
from ..Controller.GetUserAccountListController import GetUserAccountListController

strictStr = Annotated[str,StringConstraints(strip_whitespace=True, min_length=1)]


class AccountModal(BaseModel):
    user_id : int
    username : strictStr
    password : strictStr
    email : strictStr
    role_name : strictStr
    first_name : strictStr
    last_name : strictStr
    phone : strictStr
    
def require_admin(user : Account = Depends(get_current_users)):
    if user.role_id == 1:
        return user
    else:
         raise HTTPException(status_code=403, detail="Admin only")

router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])

@router.get("/dashboard", response_model=AccountModal) #Call at start of admin dashboard
def admin_dashboard(admin : Account = Depends(require_admin)) -> Account:
    return admin

@router.post("/create_account", response_model=AccountModal)
def create_account(input : AccountModal):
    controller : CreateUserAccountController = CreateUserAccountController()
    return controller.createAccount(**input)

@router.get("/user_accounts")
def get_user_accounts_list():
    controller : GetUserAccountListController = GetUserAccountListController()
    return controller.getUserAccountList()
    
    
    
    