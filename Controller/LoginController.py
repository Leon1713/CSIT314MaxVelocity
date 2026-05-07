from passlib.context import CryptContext
from Entity.Account import Account
from Entity.Session import Session
from DTO.LoginResponse import LoginResponse


class LoginController:
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    def Login(self, email: str, password: str, role: str, ip_address : str):
        try:
            res : LoginResponse
            auth:Account = Account.authenticate(email, password, role, self.pwd_context)
            sess:Session = Session.create(auth.user_id, ip_address,1*60*60)
            res = LoginResponse(sess.session_id,auth.user_id, auth.role_id)
            return res
        except Exception:
            raise
            
            
            
            
        
            
        
        
        
        
        