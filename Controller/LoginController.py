from passlib.context import CryptContext
from Entity.Account import Account
from db import get_db_connection

class LoginController:
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    def authLogin(self, email: str, password: str):
        userids = Account.findUsersByEmailOrUsername(email)
        if userids == None or userids.__len__() == 0:
            return {"error": "Invalid email/username or password"}
        user : Account
        user = userids[0] # Get the first user that matches the email/username
        return user.authenticate(password, self.pwd_context)
        