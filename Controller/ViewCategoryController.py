from Entity.FRACategory import FRACategory

class ViewCategoryController:
    def getAll(self) -> list:
            try:
                return FRACategory.getAllWithCampaignCount()
            except Exception:
                raise
