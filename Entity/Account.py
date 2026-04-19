from .DBHandler import DBHandler
from db import get_db_connection
from passlib.context import CryptContext
class Account(DBHandler):
    # Define the attributes of the Account class
    def __init__(self, user_id: int, username: str, email: str, password_hash: str, role_id: int, first_name: str, last_name: str, phone: str, is_active: bool, is_suspended: bool, created_at, updated_at, last_login):
        super().__init__()
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
            "is_suspended": self.is_suspended,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "last_login": self.last_login
        }
        
    @staticmethod
    def findUsersByEmailOrUsername(email_or_username: str):
        db_cursor = Account.db_connection.cursor(dictionary=True)
        db_cursor.execute("SELECT * FROM user_accounts WHERE email = %s OR username = %s", (email_or_username, email_or_username))
        user_data = db_cursor.fetchall()
        db_cursor.close()
        if user_data:
            return [Account(**user) for user in user_data] # For each user in the result, create an Account object and return a list of them
        return None # same as NULL
    
    @staticmethod
    def insertNewUser(account_data: dict)-> bool:
        db_cursor = Account.db_connection.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                INSERT INTO user_accounts (username, email, password_hash, role_id, first_name, last_name, phone, is_active, is_suspended)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                account_data["username"],
                account_data["email"],
                account_data["password_hash"],
                account_data["role_id"],
                account_data["first_name"],
                account_data["last_name"],
                account_data["phone"],
                account_data.get("is_active", True),  # Default to True if not provided
                account_data.get("is_suspended", False)  # Default to False if not provided
            ))

            Account.db_connection.commit() # Commit the transaction to save the new user in the database
        except Exception as e:
            print(f"Error inserting new user: {e}")
            return False # Return False to indicate failure
        finally:
            db_cursor.close() # Close the cursor to free up resources
        return True # Return True to indicate successful insertion

    def authenticate(self, password:str, hasher) -> Account:
        if hasher.verify(password, self.password_hash):
            return self
        else:
            return None # Return None to indicate authentication failure