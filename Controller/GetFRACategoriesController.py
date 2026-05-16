from Entity.FRACategory import FRACategory


class GetFRACategoriesController:
    def getCategories(self) -> list:
            try:
                return FRACategory.getAll()
            except Exception:
                raise
