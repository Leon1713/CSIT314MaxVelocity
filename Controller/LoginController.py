from passlib.context import CryptContext
from Entity.Account import Account
from Entity.Session import Session
from fastapi import Request, Response

class LoginController:
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    def authLogin(self, email: str, password: str, role: str):
        userids = Account.findUsersByEmailOrUsername(email, role)
        if userids == None or userids.__len__() == 0:
            return {"error": "Invalid email/username or password"}
        user : Account
        user = userids[0] # Get the first user that matches the email/username
        return user.authenticate(password, self.pwd_context)
    def createNewSession(account : Account, req : Request, res : Response) -> Session:
        session = Session.findSessionByUserId(account.user_id)
        
        if isinstance(session, Session):
            return session
        
        session = Session.create(account.user_id, req.client.host)
        res.set_cookie(
            key="session_token",
            value=session.session_id,
            httponly=True,
            secure=True,
            samesite="lax"
        )
        return session
        
        
        
        
        