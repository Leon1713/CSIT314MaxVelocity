import pytest
from unittest.mock import MagicMock, patch

class TestCreateFRAController:

    @patch("Controller.CreateFRAController.FundraisingActivity.create", return_value=True)
    def test_create_fra_success(self, mock_create):
        """Valid FRA data calls FundraisingActivity.create and succeeds."""
        from Controller.CreateFRAController import CreateFRAController
        ctrl = CreateFRAController()
        ctrl.createActivity(
            fundraiser_id=5, title="Help the Elderly",
            service_type="Social", description="Support elderly folks",
            category_id=1, goal_amount=3000.0,
            start_date="2024-01-01", end_date="2024-06-30"
        )
        mock_create.assert_called_once()
        data = mock_create.call_args[0][0]
        assert data["campaign_title"] == "Help the Elderly"
        assert data["goal_amount"] == 3000.0
        assert data["fundraiser_id"] == 5

    @patch("Controller.CreateFRAController.FundraisingActivity.create", side_effect=Exception("DB error"))
    def test_create_fra_db_error(self, mock_create):
        """DB error propagates out."""
        from Controller.CreateFRAController import CreateFRAController
        ctrl = CreateFRAController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.createActivity(5, "X", "Y", "Z", 1, 100.0, "2024-01-01", "2024-12-31")

    @patch("Controller.CreateFRAController.FundraisingActivity.create", return_value=True)
    def test_create_fra_builds_correct_dict(self, mock_create):
        """All fields are mapped correctly into the data dict passed to entity."""
        from Controller.CreateFRAController import CreateFRAController
        ctrl = CreateFRAController()
        ctrl.createActivity(7, "Title", "Type", "Desc", 3, 999.0, "2024-03-01", "2024-09-01")
        data = mock_create.call_args[0][0]
        assert data["fundraiser_id"] == 7
        assert data["category_id"] == 3
        assert data["service_type"] == "Type"
        assert data["end_date"] == "2024-09-01"