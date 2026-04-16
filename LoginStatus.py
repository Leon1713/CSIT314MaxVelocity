from enum import Enum
class LoginStatus(Enum):
    SUCCESS = "Login Successful"
    INVALID_CREDENTIALS = "Invalid email or password"
    ACCOUNT_LOCKED = "Account is locked"
    ACCOUNT_INACTIVE = "Account is inactive"