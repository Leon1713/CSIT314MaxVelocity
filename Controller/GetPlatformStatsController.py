from Entity.PlatformStats import PlatformStats
from db import get_db_connection


class GetPlatformStatsController:
    def getStats(self) -> dict:
            try:
                return PlatformStats.getStats()
            except Exception:
                raise

    def getRecentActivity(self, limit: int = 5) -> list:
            try:
                return PlatformStats.getRecentCategoryActivity(limit)
            except Exception:
                raise
