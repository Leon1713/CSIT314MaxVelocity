from passlib.context import CryptContext
from Entity.Account import Account
from Entity.Session import Session
from DTO.LoginResponse import LoginResponse
from db import get_db_connection

class LoginController:
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    def Login(self, email: str, password: str, role: int, ip_address : str):
            try:
                
                auth:Account = Account.authenticate(email, password, role, self.pwd_context)
                sess:Session = Session.create(auth.user_id, ip_address, 1*60*60 * 24)
                return sess
            except Exception as e:
                print(e)
                raise
            
            
            
            
        
            
        
        
        
        
        