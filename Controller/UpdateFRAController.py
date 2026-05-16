from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection


class UpdateFRAController:
    def updateActivity(self, activity_id: int, fundraiser_id: int, data: dict) -> bool:
            try:
                return FundraisingActivity.updateById(activity_id, fundraiser_id, data)
            except Exception:
                raise
