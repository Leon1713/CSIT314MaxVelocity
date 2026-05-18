import pytest
from unittest.mock import MagicMock, patch

class TestDeleteFRAController:

    @patch("Controller.DeleteFRAController.FundraisingActivity.deleteById", return_value=True)
    def test_delete_fra_success(self, mock_delete):
        """Owner can delete their own FRA."""
        from Controller.DeleteFRAController import DeleteFRAController
        ctrl = DeleteFRAController()
        result = ctrl.deleteActivity(10, 5)
        assert result is True
        mock_delete.assert_called_once_with(10, 5)

    @patch("Controller.DeleteFRAController.FundraisingActivity.deleteById", return_value=False)
    def test_delete_fra_not_found(self, mock_delete):
        """FRA not found or wrong owner returns False."""
        from Controller.DeleteFRAController import DeleteFRAController
        ctrl = DeleteFRAController()
        result = ctrl.deleteActivity(999, 5)
        assert result is False

    @patch("Controller.DeleteFRAController.FundraisingActivity.deleteById", side_effect=Exception("DB error"))
    def test_delete_fra_db_error(self, mock_delete):
        """DB error propagates."""
        from Controller.DeleteFRAController import DeleteFRAController
        ctrl = DeleteFRAController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.deleteActivity(10, 5)
