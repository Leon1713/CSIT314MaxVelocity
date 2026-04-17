from db import get_db_connection
from passlib.context import CryptContext
class Account:
    db_connection = get_db_connection() # Establish a database connection when the class is loaded
    db_cursor = db_connection.cursor(dictionary=True) # Create a cursor for executing SQL queries, with dictionary=True to return results as dictionaries
    
    # Define the attributes of the Account class
    def __init__(self, user_id: int, username: str, email: str, password_hash: str, role_id: int, first_name: str, last_name: str, phone: str, is_active: bool, is_suspended: bool, created_at, updated_at, last_login):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role_id = role_id
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.is_active = is_active
        self.is_suspended = is_suspended
        self.created_at = created_at
        self.updated_at = updated_at
        self.last_login = last_login
        
    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "role_id": self.role_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "is_active": self.is_active,
            "is_suspended": self.is_suspended
        }
        
    @staticmethod
    def findUsersByEmailOrUsername(email_or_username: str):
        Account.db_cursor.execute("SELECT * FROM user_accounts WHERE email = %s OR username = %s", (email_or_username, email_or_username))
        user_data = Account.db_cursor.fetchall()
        if user_data:
            return [Account(**user) for user in user_data] # For each user in the result, create an Account object and return a list of them
        return None # same as NULL

    def authenticate(self, password:str, hasher) -> Account:
        if hasher.verify(password, self.password_hash):
            return self
        else:
            return {"error": "Invalid email/username or password"} # return account info if successful, otherwise return message 