from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection


class GetAllFRAController:
    def getAllActivities(self, fundraiser_id: int) -> list:
            try:
                return FundraisingActivity.getAllByFundraiserId(fundraiser_id)
            except Exception:
                raise
