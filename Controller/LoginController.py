from passlib.context import CryptContext
from Entity.Account import Account

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
        