
from LoginStatus import LoginStatus
class LoginResponse:
    def __init__(self, account: "Account", login_status: LoginStatus):
        self.account = account
        self.login_status = login_status

    