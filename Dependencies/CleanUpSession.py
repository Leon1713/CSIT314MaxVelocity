
from Controller.AuthController import AuthController


class SessionCleanUp:
    def __init__(self):
        pass

    @staticmethod
    async def cleanUpExpiredSessions():
        try:
            auth_control = AuthController()
            auth_control.cleanUpExpiredSessions()
        except Exception:
            raise