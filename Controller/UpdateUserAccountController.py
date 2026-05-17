from db import get_db_connection
from passlib.context import CryptContext

from Entity.Account import Account


class UpdateUserAccountController:
    def __init__(self):
        self.pwd_hasher = CryptContext(schemes=["argon2"], deprecated="auto")

    def updateUserAccount(self, account_id, input_data: dict) -> bool:
        clean_dict = {
            ("password_hash" if k == "password" else k):
            (self.pwd_hasher.encrypt(v) if k == "password" else None if k == "password" and v =="" else v)
            for k, v in input_data.items()
        }
        try:
            return Account.update(account_id, clean_dict)
        except Exception:
            raise
