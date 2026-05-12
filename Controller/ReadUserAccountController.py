from Entity.Account import Account
from db import get_db_connection
class ReadUserAccountController:
    def __init__(self):
        pass

    def getUserAccount(self, account_id):
            db_conn = get_db_connection()
            try:
                acc : Account = Account.getUsersById(account_id)
                return acc
            except Exception:
                raise
            finally:
                db_conn.close()