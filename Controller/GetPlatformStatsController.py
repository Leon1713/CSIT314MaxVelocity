from Entity.PlatformStats import PlatformStats
from db import get_db_connection


class GetPlatformStatsController:
    def getStats(self) -> dict:
        with get_db_connection() as conn:
            try:
                return PlatformStats.getStats(conn)
            except Exception:
                raise

    def getRecentActivity(self, limit: int = 6) -> list:
        with get_db_connection() as conn:
            try:
                return PlatformStats.getRecentCategoryActivity(conn, limit)
            except Exception:
                raise
