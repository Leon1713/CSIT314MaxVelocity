from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection


class GetAllFRAController:
    def getAllActivities(self, fundraiser_id: int) -> list:
        with get_db_connection() as conn:
            try:
                return FundraisingActivity.getAllByFundraiserId(fundraiser_id, conn)
            except Exception:
                raise
