from Entity.PlatformReport import PlatformReport
from db import get_db_connection

class GetPlatformReportController:
    def getReport(self, period: str) -> dict:
        with get_db_connection() as conn:
            stats      = PlatformReport.getReportStats(period, conn)
            recent     = PlatformReport.getRecentFRAActivity(period, conn)
            chart_data = PlatformReport.getViewsByCategory(conn)
            return {"stats": stats, "recent": recent, "chart_data": chart_data}
