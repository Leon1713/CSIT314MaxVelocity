from Entity.FundraisingActivity import FundraisingActivity

class SearchFRAController:
    def search(self, fundraiser_id: int, q: str = "", filter_status: str = "") -> list:
        try:
            return FundraisingActivity.searchByFundraiserId(fundraiser_id, q, filter_status)
        except Exception:
            raise
