from Entity.FRACategory import FRACategory
from db import get_db_connection

class GetFRACategoriesController:
    def getCategories(self) -> list:
        with get_db_connection() as conn:
            try:
                return FRACategory.getAll(conn)
            except Exception:
                raise
