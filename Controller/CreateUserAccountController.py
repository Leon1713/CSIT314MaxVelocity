import datetime
from db import get_db_connection
from Entity.Account import Account
from passlib.context import CryptContext


class CreateUserAccountController:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
        
    def createAccount(self, username : str, password : str, email : str, role_name : str, first_name : str, last_name : str, phone : str) -> Account:
            try:
                hashedPw = self.pwd_context.hash(password)
                now = datetime.datetime.now()
                roleId = Account.getRoleId(role_name)
                newAcc = Account(None, username, email, hashedPw, roleId,
                                first_name, last_name, phone, True, False, now, now, now)
                if Account.insertNewUser(newAcc.to_dict()):
                    return {"success": True}
                else:
                    return {"success": False, "error": "Failed to insert user"}
            except ValueError as e:
                return {"success": False, "error": str(e)}
            except Exception as e:
                return {"success": False, "error": "An unexpected error occurred"}