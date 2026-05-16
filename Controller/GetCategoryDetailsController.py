from Entity.FRACategory import FRACategory
from db import get_db_connection


class GetCategoryDetailsController:
    def getCategory(self, category_id: int):
            try:
                return FRACategory.getById(category_id)
            except Exception:
                raise
