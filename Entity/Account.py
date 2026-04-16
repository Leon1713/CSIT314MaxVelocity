from .LoginResponse import LoginResponse
from LoginStatus import LoginStatus
class Account:
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
    def authenticate(self, password:str, hasher) -> LoginResponse:
        if hasher.verify(password, self.password_hash):
            return LoginResponse(account=self, login_status=LoginStatus.SUCCESS)
        else:
            return LoginResponse(account=self, login_status=LoginStatus.INVALID_CREDENTIALS)