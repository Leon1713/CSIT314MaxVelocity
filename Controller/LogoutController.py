from Entity.Session import Session
class LogoutController:
    def __init__(self):
        pass
    def logout(self, session_id : int) -> bool:
        try:
            return Session.deactivate(session_id)
        except Exception:
            return False
        