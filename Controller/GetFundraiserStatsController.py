from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class GetFundraiserStatsController:
    def getStats(self, fundraiser_id: int) -> dict:
        with get_db_connection() as conn:
            try:
                return FundraisingActivity.getStatsByFundraiserId(fundraiser_id,conn)
            except Exception:
                raise

    def getRecentActivities(self, fundraiser_id: int, limit: int = 5) -> list:
        with get_db_connection() as conn:
            try:
                return FundraisingActivity.getRecentByFundraiserId(fundraiser_id, conn, limit)
            except Exception:
                raise
