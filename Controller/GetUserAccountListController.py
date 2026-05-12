
from Entity.Account import Account

class GetUserAccountListController:
    def __init__(self):
        pass

    def getUserAccountList(self):
        try:
            accounts = Account.getAllUsers()
            return accounts
        except Exception:
            raise