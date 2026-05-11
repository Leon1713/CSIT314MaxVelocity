from Entity.FundraisingActivity import FundraisingActivity


class GetFundraiserStatsController:
    def getStats(self, fundraiser_id: int) -> dict:
        try:
            return FundraisingActivity.getStatsByFundraiserId(fundraiser_id)
        except Exception:
            raise

    def getRecentActivities(self, fundraiser_id: int, limit: int = 5) -> list:
        try:
            return FundraisingActivity.getRecentByFundraiserId(fundraiser_id, limit)
        except Exception:
            raise
