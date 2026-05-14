import os, shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from Dependencies.Auth import get_current_users
from Controller.GetUserProfileController import GetUserProfileController
from Controller.UpdateUserProfileController import UpdateUserProfileController
from Entity.UserProfile import UserProfile
from db import get_db_connection

UPLOAD_DIR = Path("uploads/profile_pictures")
BASE_URL   = "http://127.0.0.1:8000"

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


@router.post("/picture")
async def upload_picture(
    file: UploadFile = File(...),
    user: "Account" = Depends(get_current_users)
):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")
    ext      = Path(file.filename).suffix.lower() or ".jpg"
    filename = f"{user.user_id}{ext}"
    dest     = UPLOAD_DIR / filename
    try:
        with open(dest, "wb") as f:
            shutil.copyfileobj(file.file, f)
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                INSERT INTO user_profiles (user_id, profile_picture)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE profile_picture = VALUES(profile_picture)
            """, (user.user_id, filename))
            conn.commit()
            cursor.close()
        return {"url": f"{BASE_URL}/uploads/profile_pictures/{filename}"}
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
