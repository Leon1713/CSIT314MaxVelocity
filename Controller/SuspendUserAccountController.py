from db import get_db_connection
from Entity.Account import Account
from Entity.Session import Session
from db import get_db_connection
class SuspendUserAccountController:
    def __init__(self):
        pass
    def suspend(self, user_id : int) -> bool:
        with get_db_connection() as db_con:
            try:
                Account.suspend(user_id, db_con)
                Session.deactivate(Session.findSessionByUserId(user_id, db_con).session_id, db_con)
                return True
            except Exception:
                raise