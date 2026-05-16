from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class DeleteFRAController:
    def deleteActivity(self, activity_id: int, fundraiser_id: int) -> bool:
            try:
                return FundraisingActivity.deleteById(activity_id, fundraiser_id)
            except Exception:
                raise
