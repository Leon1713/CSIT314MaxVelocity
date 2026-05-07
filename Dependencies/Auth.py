from fastapi import Cookie
from Controller.AuthController import AuthController
def get_current_users(session_id : str = Cookie(None, alias="token")):
    try:
        controller = AuthController()
        user = controller.AuthSession(session_id)
        return user
    except Exception:
        return None
        