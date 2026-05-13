from __future__ import annotations
from typing import Annotated, Optional

from Entity.Account import Account
from Entity.Profile import Profile
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, StringConstraints
from Controller.CreateProfileController import CreateProfileController
from Controller.UpdateUserAccountController import UpdateUserAccountController
from Dependencies.Auth import get_current_users
from Controller.CreateUserAccountController import CreateUserAccountController
from Controller.GetUserAccountListController import GetUserAccountListController
from Controller.ReadUserAccountController import ReadUserAccountController
from Controller.SuspendUserAccountController import SuspendUserAccountController
from Controller.SuspendUserProfileController import SuspendUserProfileController
from Controller.ViewUserProfileController import ViewUserProfileController
from Controller.UpdateProfileController import UpdateProfileController
from Dependencies.Auth import require_permission


strictStr = Annotated[str,StringConstraints(strip_whitespace=True, min_length=1)]


class AccountModal(BaseModel):
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
class ProfileModal(BaseModel):
    role_name : strictStr
    description : str
    
    can_manage_user_account : bool
    can_manage_user_profile : bool
    can_manage_fr : bool
    can_view_fra : bool
    can_manage_fra_favourite : bool
    can_view_fr_analytics : bool
    can_manage_donation : bool
    can_manage_fra_category : bool
    can_generate_report : bool
    
class UpdateProfileModal(BaseModel):
    role_name : Optional[strictStr] = None
    description : Optional[str] = None
    
    can_manage_user_account : Optional[bool] = None
    can_manage_user_profile : Optional[bool] = None
    can_manage_fr : Optional[bool] = None
    can_view_fra : Optional[bool] = None
    can_manage_fra_favourite : Optional[bool] = None
    can_view_fr_analytics : Optional[bool] = None
    can_manage_donation : Optional[bool] = None
    can_manage_fra_category : Optional[bool] = None
    can_generate_report : Optional[bool] = None
     
    
def require_admin(user : Account = Depends(require_permission("can_access_admin_dashboard"))):
    if user and user.role_id == 1:
        return user
    else:
         raise HTTPException(status_code=403, detail="Admin only")

router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])

#User accounts
@router.get("/dashboard", response_model=AccountModal) # Call at start of admin dashboard
def admin_dashboard(admin : Account = Depends(require_admin)) -> Account:
    return admin

@router.post("/create_account", dependencies=[Depends(require_permission("can_manage_user_account"))])
def create_account(input : AccountModal):
    controller : CreateUserAccountController = CreateUserAccountController()
    return controller.createAccount(**input.model_dump())

@router.get("/user_accounts", dependencies=[Depends(require_permission("can_manage_user_account"))])
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

@router.get("/user_accounts/{user_id}", dependencies=[Depends(require_permission("can_manage_user_account"))])
def get_user_account_details(user_id : int):
    controller : ReadUserAccountController = ReadUserAccountController()
    acc : Account = controller.getUserAccount(user_id)
    if acc is None:
        raise HTTPException(status_code=404, detail="User not found")
    return acc.to_dict()

@router.patch("/user_accounts/{user_id}", dependencies=[Depends(require_permission("can_manage_user_account"))])
def update_user_account(user_id : int, input : AccountUpdateModal):
    controller : UpdateUserAccountController = UpdateUserAccountController()
    input_dict = input.model_dump(exclude_unset=True)
    try:
        controller.updateUserAccount(user_id, input_dict)
    except Exception:
           raise HTTPException(status_code=404, detail="Failed to update Accounts")
    return True

@router.post("/user_accounts/{user_id}/suspend", dependencies=[Depends(require_permission("can_manage_user_account"))])
def suspend_user_account(user_id : int) -> bool:
    suspend_account_controller : SuspendUserAccountController = SuspendUserAccountController()
    try:
        suspend_account_controller.suspend(user_id)
        return True
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Failed to suspend account")
# Search (backend-way)


# User Profile
@router.post("/create_profile", dependencies=[Depends(require_permission("can_manage_user_profile"))])
def create_user_profile(input : ProfileModal):
    try:
        profileDictionary = input.model_dump()
        controller : CreateProfileController = CreateProfileController()
        return controller.createProfile(profileDictionary)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create Profile")
@router.get("/user_profiles", dependencies=[Depends(require_permission("can_manage_user_profile"))])
def view_user_profiles_list():
    controller : ViewUserProfileController = ViewUserProfileController()
    try:
        profile_list : list[Profile] = controller.getUserProfilesAll()
        return profile_list
    except Exception as e:
        print(e.msg)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Profiles found")
@router.get("/user_profiles/{profile_id}", dependencies=[Depends(require_permission("can_manage_user_profile"))])
def view_user_profile(profile_id : int):
    controller : ViewUserProfileController = ViewUserProfileController()
    try:
        profile : Profile = controller.getUserProfile(profile_id)
        return profile
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Profiles found.")
@router.patch("/user_profiles/{profile_id}", dependencies=[Depends(require_permission("can_manage_user_profile"))])
def update_user_profile(profile_id : int, profile_modal : UpdateProfileModal):
    controller : UpdateProfileController = UpdateProfileController()
    try:
        profile_dict = profile_modal.model_dump(exclude_unset=True)
        return controller.update(profile_id, profile_dict)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update profile.")
@router.post("/user_profiles/{profile_id}/suspend", dependencies=[Depends(require_permission("can_manage_user_profile"))])
def suspend_user_profile(profile_id : int) -> bool:
    controller : SuspendUserProfileController = SuspendUserProfileController()
    try:
        return controller.suspend(profile_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to suspend user profile.")
# Search User Profile (Frontend)
    
    