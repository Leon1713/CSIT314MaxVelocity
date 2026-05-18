from passlib.context import CryptContext
from db import get_db_connection
import random
class AdminInsert:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    def insertAccount(self,fn:str, ln : str, email : str, username:str, phone_no : str, pw : str, role_id : int):
        with get_db_connection() as conn:
            try:
                db_cursor = conn.cursor()
                hashed = self.pwd_context.hash(pw)
                parts = []
                for i in range(7):
                    parts.append("%s")  
                db_cursor.execute(
                    f"INSERT INTO user_accounts (first_name, last_name, email, username, phone, password_hash, role_id) VALUES ({','.join(parts)})",
                (fn,ln,email,username,phone_no, hashed, role_id))
                conn.commit()
            except Exception as e:
                print(e)
                raise
            finally:
                db_cursor.close()
obj = AdminInsert()

for i in range(1, 100):
    obj.insertAccount(f"User{i}",None,f"User{i}",f"User{i}",999999,"P@ssw0rd",random.randint(1,4))
        
    