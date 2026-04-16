from passlib.context import CryptContext
from Entity.Account import Account
from db import get_db_connection

class LoginController:
    
    def __init__(self):
        self.db = get_db_connection()
        self.db_cursor = self.db.cursor(dictionary=True)
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def authLogin(self, email: str, password: str):
        self.db_cursor.execute("SELECT * FROM user_accounts WHERE email = %s OR username = %s", (email, email))
        userids = self.db_cursor.fetchall()
        if userids.__len__() == 0:
            return {"error": "Invalid email/username or password"}
        tempAccount = Account(
            user_id=userids[0]['user_id'],
            username=userids[0]['username'],
            email=userids[0]['email'],
            password_hash=userids[0]['password_hash'],
            role_id=userids[0]['role_id'],
            first_name=userids[0]['first_name'],
            last_name=userids[0]['last_name'],
            phone = userids[0]['phone'],
            is_active = userids[0]['is_active'],
            is_suspended = userids[0]['is_suspended'],
            created_at = userids[0]['created_at'],
            updated_at = userids[0]['updated_at'],
            last_login = userids[0]['last_login']
        )
        return tempAccount.authenticate(password, self.pwd_context).login_status.value