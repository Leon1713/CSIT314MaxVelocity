from Entity.FRACategory import FRACategory

class CreateCategoryController:
    def create(self, data: dict) -> bool:
            try:
                return FRACategory.create(data)
            except Exception:
                raise
