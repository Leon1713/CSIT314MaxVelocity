
from Entity.Account import Account
from db import get_db_connection
class GetUserAccountListController:
    def __init__(self):
        pass

    def getUserAccountList(self):
        db_conn =get_db_connection()
        try:
            accounts = Account.getAllUsers(db_conn)
            return accounts
        except Exception:
            raise
        finally:
            db_conn.close()