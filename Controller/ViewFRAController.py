from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection
class ViewFRAController:
    def __init__(self):
        pass

    def getFRAList(self):
        with get_db_connection() as conn:
            return FundraisingActivity.getAll(conn)

    def getFRA(self, fra_id: int):
        with get_db_connection() as conn:
            return FundraisingActivity.getById(fra_id, conn)