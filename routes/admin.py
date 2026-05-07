from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, StringConstraints
from Controller.UpdateUserAccountController import UpdateUserAccountController
from Dependencies.Auth import get_current_users
from Controller.CreateUserAccountController import CreateUserAccountController
from Controller.GetUserAccountListController import GetUserAccountListController
from Controller.ReadUserAccountController import ReadUserAccountController
from Controller.SuspendUserAccountController import SuspendUserAccountController

from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from Entity.Account import Account

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
    
class AccountUpdateModal(BaseModel):
    username : Optional[str] = None
    password : Optional[str] = None
    email : Optional[str] = None
    role_name : Optional[str] = None
    first_name : Optional[str] = None
    last_name : Optional[str] = None
    phone : Optional[str] = None
    
def require_admin(user : Account = Depends(get_current_users)):
    if user.role_id == 1:
        return user
    else:
         raise HTTPException(status_code=403, detail="Admin only")

router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])

#User accounts
@router.get("/dashboard", response_model=AccountModal) # Call at start of admin dashboard
def admin_dashboard(admin : Account = Depends(require_admin)) -> Account:
    return admin

@router.post("/create_account", response_model=AccountModal)
def create_account(input : AccountModal):
    controller : CreateUserAccountController = CreateUserAccountController()
    return controller.createAccount(**input)

@router.get("/user_accounts")
def get_user_accounts_list():
    controller : GetUserAccountListController = GetUserAccountListController()
    accounts = controller.getUserAccountList()
    account_info_list = []
    for acc in accounts:
        account_info_list.append({
            "user_id" : acc.user_id,
            "username" : acc.username,
            "role_id" : acc.role_id,
            "last_login" : acc.last_login
        })
    return account_info_list

@router.get("/user_accounts/{user_id}")
def get_user_account_details(user_id : int):
    controller : ReadUserAccountController = ReadUserAccountController()
    acc : Account = controller.getUserAccount(user_id)
    if acc is None:
        raise HTTPException(status_code=404, detail="User not found")
    return acc.to_dict()

@router.patch("/user_accounts/{user_id}")
def update_user_account(user_id : int, input : AccountUpdateModal):
    controller : UpdateUserAccountController = UpdateUserAccountController()
    input_dict = input.model_dump(exclude_unset=True)
    try:
        controller.updateUserAccount(user_id, input_dict)
    except Exception:
           raise HTTPException(status_code=404, detail="Failed to update Accounts")
    return True

@router.post("/user_accounts/{user_id}/suspend")
def suspend_user_account(user_id : int) -> bool:
    suspend_account_controller : SuspendUserAccountController = SuspendUserAccountController()
    try:
        suspend_account_controller.suspend(user_id)
        return {"success" : True}
    except Exception:
        raise HTTPException(status_code=404, detail="Failed to suspend account")
# User Profile


    

