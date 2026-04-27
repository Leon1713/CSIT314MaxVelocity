from passlib.context import CryptContext
from Entity.Account import Account
from Entity.Session import Session
from fastapi import Request, Response, HTTPException


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
    
    def createNewSession(self, account : Account, req : Request, res : Response) -> Session:
        session = Session.create(account.user_id, req.client.host)
        return session
    def getCurrentSession(self, request: Request) -> Session:
        token = request.cookies.get("session_token")
        if not token:
            return None
        try:
            session = Session.getSessionBySessionId(token)
            return session
        except Exception as e:
            return None
            
            
        
            
        
        
        
        
        