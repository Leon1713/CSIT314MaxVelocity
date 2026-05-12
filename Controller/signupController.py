from Entity.Account import Account
from passlib.context import CryptContext
from db import get_db_connection
import datetime
class signupController:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    
    def signupUser(self, email: str, user: str, pw: str, roles: str = None,
               first_name: str = "", last_name: str = "", phone: str = ""):
        with get_db_connection() as conn:
            try:
                hashedPw = self.pwd_context.hash(pw)
                now = datetime.datetime.now
                roleId = Account.getRoleId(roles, conn)
                newAcc = Account(None, user, email, hashedPw, roleId,
                                first_name, last_name, phone, True, False, now, "", None)
                if Account.insertNewUser(newAcc.to_dict(), conn):
                    return {"success": True}
                else:
                    return {"success": False, "error": "username/email already exists"}
            except ValueError as e:
                return {"success": False, "error": str(e)}
            except Exception as e:
                return {"success": False, "error": "An unexpected error occurred"}
            
            
