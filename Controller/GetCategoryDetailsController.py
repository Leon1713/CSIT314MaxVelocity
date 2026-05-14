from Entity.FRACategory import FRACategory
from db import get_db_connection


class GetCategoryDetailsController:
    def getCategory(self, category_id: int):
        with get_db_connection() as conn:
            try:
                return FRACategory.getById(category_id, conn)
            except Exception:
                raise
