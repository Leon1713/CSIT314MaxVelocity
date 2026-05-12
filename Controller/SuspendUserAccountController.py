from db import get_db_connection
from Entity.Account import Account
from Entity.Session import Session
class SuspendUserAccountController:
    def __init__(self):
        pass
    def suspend(self, user_id : int) -> bool:
        db_con = get_db_connection()
        try:
            Account.suspend(user_id, db_con)
            Session.deactivate(Session.findSessionByUserId(user_id).session_id)
            return True
        except Exception:
            raise
        finally:
            db_con.close()