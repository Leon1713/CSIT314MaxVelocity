from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection
class ViewFRAController:
    def __init__(self):
        pass

    def getFRAList(self):
            return FundraisingActivity.getAll()

    def getFRA(self, fra_id: int):
            return FundraisingActivity.getById(fra_id)