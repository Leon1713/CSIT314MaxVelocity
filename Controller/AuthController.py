from fastapi import HTTPException
from db import get_db_connection
#need check
from Entity.Session import Session
from Entity.Account import Account
from Entity.Profile import Profile
class AuthController:
    def AuthSession(self, session_id : str) -> Account:
        with get_db_connection() as conn:
            try:
                session : Session = Session.getSessionBySessionId(session_id, conn)
                return  Account.getUsersById(session.user_id, conn)
            except Exception:
                raise HTTPException(status_code=404, detail="Item not found")
    def cleanUpExpiredSessions(self):
        with get_db_connection() as conn:
            try:
                Session.cleanUpExpiredSessions(conn)
            except Exception:
                raise
    def hasPermissions(self, user : Account, permissionName : str) -> bool:
        with get_db_connection() as conn:
            try:
                profile = Profile.GetProfileByRoleId(user.role_id, conn)
                # Admin users have full access to everything
                if getattr(profile, 'can_access_admin_dashboard', False):
                    return True
                return getattr(profile, permissionName)
            except Exception:
                raise HTTPException(status_code=404, detail="Failed to get roles")        
        
            

            