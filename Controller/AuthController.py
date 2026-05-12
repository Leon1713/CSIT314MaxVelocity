from fastapi import HTTPException
from db import get_db_connection
#need check
from Entity.Session import Session
from Entity.Account import Account
from Entity.Profile import Profile
class AuthController:
    auth_conn = get_db_connection()
    def AuthSession(self, session_id : str) -> Account:
        try:
            session : Session = Session.getSessionBySessionId(session_id, AuthController.auth_conn)
            account = Account.getUsersById(session.user_id, AuthController.auth_conn)
            return account
        except Exception:
            raise HTTPException(status_code=404, detail="Item not found")
    def cleanUpExpiredSessions(self):
        try:
            Session.cleanUpExpiredSessions(AuthController.auth_conn)
        except Exception:
            raise
    def hasPermissions(self, user : Account, permissionName : str) -> bool:
        try:
            profile = Profile.GetProfileByRoleId(user.role_id, AuthController.auth_conn)
            return getattr(profile, permissionName)
        except Exception:
            raise HTTPException(status_code=404, detail="Failed to get roles")
    @staticmethod
    def closeAuthConn():
        AuthController.auth_conn.close()
        
        
            

            