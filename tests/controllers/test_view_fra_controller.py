import pytest
from unittest.mock import MagicMock, patch


class TestViewFRAController:

    @patch("Controller.ViewFRAController.FundraisingActivity.getByIdAndFundraiser")
    def test_get_activity_success(self, mock_get, mock_fra):
        """Fetching an FRA by ID and fundraiser returns the row."""
        from Controller.ViewFRAController import ViewFRAController
        mock_get.return_value = mock_fra
        ctrl = ViewFRAController()
        result = ctrl.getActivity(10, 5)
        assert result["campaign_title"] == "Save the Trees"
        mock_get.assert_called_once_with(10, 5)

    @patch("Controller.ViewFRAController.FundraisingActivity.getByIdAndFundraiser", return_value=None)
    def test_get_activity_not_found(self, mock_get):
        """Missing FRA returns None — controller does not raise."""
        from Controller.ViewFRAController import ViewFRAController
        ctrl = ViewFRAController()
        result = ctrl.getActivity(999, 5)
        assert result is None

    @patch("Controller.ViewFRAController.FundraisingActivity.getFundRaisingActivityById")
    def test_get_activity_by_fra_id(self, mock_get, mock_fra):
        """Public FRA lookup by ID works correctly."""
        from Controller.ViewFRAController import ViewFRAController
        mock_get.return_value = mock_fra
        ctrl = ViewFRAController()
        result = ctrl.getActivityByFRAId(10)
        assert result["id"] == 10
        mock_get.assert_called_once_with(10)

    @patch("Controller.ViewFRAController.FundraisingActivity.getFundRaisingActivityById", side_effect=Exception("DB error"))
    def test_get_activity_by_fra_id_db_error(self, mock_get):
        """DB error propagates out."""
        from Controller.ViewFRAController import ViewFRAController
        ctrl = ViewFRAController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.getActivityByFRAId(10)
