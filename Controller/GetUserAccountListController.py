
from Entity.Account import Account
from db import get_db_connection
class GetUserAccountListController:
    def __init__(self):
        pass

    def getUserAccountList(self):
        with get_db_connection() as db_conn:
            try:
                accounts = Account.getAllUsersWithRoles(db_conn)
                return accounts
            except Exception as e:
                print(e)
                raise
