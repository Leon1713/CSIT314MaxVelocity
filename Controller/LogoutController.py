from Entity.Session import Session
from db import get_db_connection
class LogoutController:
    def __init__(self):
        pass
    def logout(self, session_id : str) -> bool:
            try:
                return Session.deactivate(session_id)
            except Exception:
                return False
        