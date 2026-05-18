from Entity.FundraisingActivity import FundraisingActivity

class ViewFRAListController:
    def getAllActivities(self, fundraiser_id: int) -> list:
        try:
            return FundraisingActivity.getAllByFundraiserId(fundraiser_id)
        except Exception:
            raise
