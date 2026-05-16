from db import get_db_connection
from Entity.Account import Account
class UpdateUserAccountController:
    def __init__(self):
        pass
    def updateUserAccount(self, account_id, input_data : dict) -> bool:
            try:
                acc : Account = Account.getUsersById(account_id)
                for key, value in input_data.items():
                    setattr(acc, key, value)
                return acc.update()
            except Exception:
                raise