from Entity.FRACategory import FRACategory

class SearchCategoryController:
    def search(self, q: str = "", status: str = "") -> list:
        try:
            return FRACategory.search(q, status)
        except Exception:
            raise
