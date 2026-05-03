from Entity.Account import Account
from passlib.context import CryptContext
import datetime
class signupController:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    
    def signupUser(self, email: str, user: str, pw: str, roles: str = None,
               first_name: str = "", last_name: str = "", phone: str = ""):
        hashedPw = self.pwd_context.hash(pw)
        now = datetime.datetime.now
        roleId = Account.getRoleId(roles)
        newAcc = Account(None, user, email, hashedPw, roleId,
                        first_name, last_name, phone, True, False, now, "", None)
        if Account.insertNewUser(newAcc.to_dict()):
            return True
        else:
            return False
        
        
