from Entity.FRACategory import FRACategory

class DeleteCategoryController:
    def delete(self, category_id: int) -> bool:
            try:
                return FRACategory.deleteById(category_id)
            except Exception:
                raise
