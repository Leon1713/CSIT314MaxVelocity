from Entity.Session import Session
from db import get_db_connection
class LogoutController:
    def __init__(self):
        pass
    def logout(self, session_id : int) -> bool:
        with get_db_connection() as conn:
            try:
                return Session.deactivate(session_id, conn)
            except Exception:
                return False
        