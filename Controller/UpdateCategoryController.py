from Entity.FRACategory import FRACategory

class UpdateCategoryController:
    def update(self, category_id: int, data: dict) -> bool:
            try:
                return FRACategory.updateById(category_id, data)
            except Exception:
                raise
