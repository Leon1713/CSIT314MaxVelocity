import pytest
from unittest.mock import MagicMock, patch


class TestSuspendUserAccountController:

    @patch("Controller.SuspendUserAccountController.Session.deactivate")
    @patch("Controller.SuspendUserAccountController.Session.findSessionByUserId")
    @patch("Controller.SuspendUserAccountController.Account.suspend")
    def test_suspend_user_with_active_session(self, mock_suspend, mock_find_sess, mock_deactivate):
        """Suspending a user who has an active session also deactivates that session."""
        from Controller.SuspendUserAccountController import SuspendUserAccountController
        mock_sess = MagicMock()
        mock_sess.session_id = "sess-xyz"
        mock_find_sess.return_value = mock_sess

        ctrl = SuspendUserAccountController()
        result = ctrl.suspend(42)

        mock_suspend.assert_called_once_with(42)
        mock_deactivate.assert_called_once_with("sess-xyz")
        assert result is True

    @patch("Controller.SuspendUserAccountController.Session.findSessionByUserId", return_value=None)
    @patch("Controller.SuspendUserAccountController.Account.suspend")
    def test_suspend_user_no_active_session(self, mock_suspend, mock_find_sess):
        """Suspending a user with no active session still returns True."""
        from Controller.SuspendUserAccountController import SuspendUserAccountController
        ctrl = SuspendUserAccountController()
        result = ctrl.suspend(99)

        mock_suspend.assert_called_once_with(99)
        assert result is True

    @patch("Controller.SuspendUserAccountController.Account.suspend", side_effect=Exception("DB error"))
    def test_suspend_user_db_error(self, mock_suspend):
        """DB error on suspend propagates out."""
        from Controller.SuspendUserAccountController import SuspendUserAccountController
        ctrl = SuspendUserAccountController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.suspend(1)
