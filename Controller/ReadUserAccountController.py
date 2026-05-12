from Entity.Account import Account
from db import get_db_connection
class ReadUserAccountController:
    def __init__(self):
        pass

    def getUserAccount(self, account_id):
        with get_db_connection() as db_conn:
            try:
                acc : Account = Account.getUsersById(account_id, db_conn)
                return acc
            except Exception:
                raise