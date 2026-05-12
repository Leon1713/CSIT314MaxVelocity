from Entity.UserProfile import UserProfile
from db import get_db_connection


class GetUserProfileController:
    def getProfile(self, user) -> dict:
        with get_db_connection() as conn:
            try:
                profile = UserProfile.getByUserId(user.user_id, conn)
                return {
                    "user_id":    user.user_id,
                    "username":   user.username,
                    "email":      user.email,
                    "first_name": user.first_name or "",
                    "last_name":  user.last_name  or "",
                    "phone":      user.phone       or "",
                    "bio":        profile["bio"]     if profile else "",
                    "address":    profile["address"] if profile else "",
                    "city":       profile["city"]    if profile else "",
                    "country":    profile["country"] if profile else "",
                }
            except Exception:
                raise
