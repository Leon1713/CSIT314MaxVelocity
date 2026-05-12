from passlib.context import CryptContext
from Entity.Account import Account
from Entity.Session import Session
from DTO.LoginResponse import LoginResponse
from db import get_db_connection

class LoginController:
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    def Login(self, email: str, password: str, role: str, ip_address : str):
        with get_db_connection() as conn:
            try:
                res : LoginResponse
                auth:Account = Account.authenticate(email, password, role, self.pwd_context, conn)
                sess:Session = Session.create(auth.user_id, ip_address,conn, 1*60*60)
                res = LoginResponse(sess.session_id,auth.user_id, auth.role_id)
                return res
            except Exception as e:
                print(e)
                raise
            
            
            
            
        
            
        
        
        
        
        