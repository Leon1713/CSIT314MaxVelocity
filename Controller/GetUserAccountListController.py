
from Entity.Account import Account
from db import get_db_connection
class GetUserAccountListController:
    def __init__(self):
        pass

    def getUserAccountList(self):
            try:
                accounts = Account.getAllUsersWithRoles()
                return accounts
            except Exception as e:
                print(e)
                raise
