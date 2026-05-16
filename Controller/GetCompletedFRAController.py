from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class GetCompletedFRAController:
    def getCompleted(self, fundraiser_id: int, filters: dict) -> list:
        with get_db_connection() as conn:
            return FundraisingActivity.getCompletedByFundraiserId(fundraiser_id, filters, conn)
