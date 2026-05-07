from Entity.Account import Account
from Entity.Session import Session
class SuspendUserAccountController:
    def __init__(self):
        pass
    def suspend(user_id : int) -> bool:
        try:
            Account.suspend(user_id)
            return True
        except Exception:
            raise