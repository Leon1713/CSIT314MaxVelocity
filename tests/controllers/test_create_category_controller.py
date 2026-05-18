import pytest
from unittest.mock import MagicMock, patch


class TestCreateCategoryController:

    @patch("Controller.CreateCategoryController.FRACategory.create", return_value=True)
    def test_create_category_success(self, mock_create):
        """Valid category data creates successfully."""
        from Controller.CreateCategoryController import CreateCategoryController
        ctrl = CreateCategoryController()
        result = ctrl.create({"category_name": "Education",
                             "category_description": "Edu campaigns", "is_active": 1})
        assert result is True
        mock_create.assert_called_once()

    @patch("Controller.CreateCategoryController.FRACategory.create", side_effect=Exception("duplicate name"))
    def test_create_duplicate_category(self, mock_create):
        """Duplicate category name raises an exception."""
        from Controller.CreateCategoryController import CreateCategoryController
        ctrl = CreateCategoryController()
        with pytest.raises(Exception, match="duplicate name"):
            ctrl.create({"category_name": "Education"})

    @patch("Controller.CreateCategoryController.FRACategory.create", side_effect=Exception("DB error"))
    def test_create_category_db_error(self, mock_create):
        """DB error propagates."""
        from Controller.CreateCategoryController import CreateCategoryController
        ctrl = CreateCategoryController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.create({"category_name": "New"})
