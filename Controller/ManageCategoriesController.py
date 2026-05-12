from Entity.FRACategory import FRACategory
from db import get_db_connection


class ManageCategoriesController:
    def getAll(self) -> list:
        with get_db_connection() as conn:
            try:
                return FRACategory.getAllWithCampaignCount(conn)
            except Exception:
                raise

    def create(self, data: dict) -> bool:
        with get_db_connection() as conn:
            try:
                return FRACategory.create(data, conn)
            except Exception:
                raise

    def update(self, category_id: int, data: dict) -> bool:
        with get_db_connection() as conn:
            try:
                return FRACategory.updateById(category_id, data, conn)
            except Exception:
                raise

    def delete(self, category_id: int) -> bool:
        with get_db_connection() as conn:
            try:
                return FRACategory.deleteById(category_id, conn)
            except Exception:
                raise
