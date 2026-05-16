from Entity.FRACategory import FRACategory
class ManageCategoriesController:
    def getAll(self) -> list:

            try:
                return FRACategory.getAllWithCampaignCount()
            except Exception:
                raise

    def create(self, data: dict) -> bool:

            try:
                return FRACategory.create(data )
            except Exception:
                raise

    def update(self, category_id: int, data: dict) -> bool:

            try:
                return FRACategory.updateById(category_id, data )
            except Exception:
                raise

    def delete(self, category_id: int) -> bool:

            try:
                return FRACategory.deleteById(category_id )
            except Exception:
                raise
