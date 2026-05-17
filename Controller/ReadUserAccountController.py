from Entity.Account import Account
from Entity.Profile import Profile
from db import get_db_connection
class ReadUserAccountController:
    def __init__(self):
        pass

    def getUserAccount(self, account_id):
            try:
                acc = Account.GetUsersById(account_id)
                return acc
            except Exception:
                raise