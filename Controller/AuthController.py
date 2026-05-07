from fastapi import HTTPException
#need check
from Entity.Session import Session
from Entity.Account import Account
class AuthController:
    def AuthSession(self, session_id : str) -> Account:
        try:
            session : Session = Session.getSessionBySessionId(session_id)
            account = Account.getUsersById(session.user_id)
            return account
        except Exception:
            raise HTTPException(status_code=404, detail="Item not found")
            

            