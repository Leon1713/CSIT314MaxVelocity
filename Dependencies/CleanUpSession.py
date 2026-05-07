
from Controller.AuthController import AuthController


class SessionCleanUp:
    def __init__(self):
        pass

    @staticmethod
    async def cleanUpExpiredSessions(self):
        try:
            AuthController.cleanUpExpiredSessions()
        except Exception:
            raise