from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class GetCompletedFRAController:
    def getCompleted(self, fundraiser_id: int, filters: dict) -> list:
            return FundraisingActivity.getCompletedByFundraiserId(fundraiser_id, filters)
