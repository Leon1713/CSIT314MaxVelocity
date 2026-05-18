from Entity.FundraisingActivity import FundraisingActivity

class SearchFRAController:
    def search(self, fundraiser_id: int, q: str = "", filter_status: str = "") -> list:
        try:
            return FundraisingActivity.searchByFundraiserId(fundraiser_id, q, filter_status)
        except Exception:
            raise
    def doneeSearchFRA(self, keyword, category_id, date_from, date_to):
        try:
            return FundraisingActivity.searchFRA(keyword,category_id,date_from,date_to)
        except Exception as e:
            print(e)
            raise
