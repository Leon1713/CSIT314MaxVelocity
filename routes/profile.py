from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from Dependencies.Auth import get_current_users
from Controller.GetUserProfileController import GetUserProfileController
from Controller.UpdateUserProfileController import UpdateUserProfileController

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from Entity.Account import Account

router = APIRouter(prefix="/profile")


class UpdateProfileInput(BaseModel):
    first_name: Optional[str] = None
    last_name:  Optional[str] = None
    email:      Optional[str] = None
    phone:      Optional[str] = None
    bio:        Optional[str] = None
    address:    Optional[str] = None
    city:       Optional[str] = None
    country:    Optional[str] = None


@router.get("")
def get_profile(user: "Account" = Depends(get_current_users)):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        return GetUserProfileController().getProfile(user)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("")
def update_profile(
    data: UpdateProfileInput,
    user: "Account" = Depends(get_current_users)
):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        UpdateUserProfileController().updateProfile(user.user_id, data.model_dump(exclude_none=True))
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
