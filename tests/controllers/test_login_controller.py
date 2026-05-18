
import pytest
from unittest.mock import MagicMock, patch


class TestLoginController:

    @patch("Controller.LoginController.Session.create")
    @patch("Controller.LoginController.Account.authenticate")
    def test_login_valid_credentials(self, mock_auth, mock_session, mock_account):
        """Valid email + password + role returns a session object."""
        from Controller.LoginController import LoginController
        mock_auth.return_value = mock_account
        mock_session.return_value = MagicMock(session_id="sess-abc")

        ctrl = LoginController()
        result = ctrl.Login("test@example.com", "Password@1", 3, "127.0.0.1")

        mock_auth.assert_called_once()
        mock_session.assert_called_once()
        assert result.session_id == "sess-abc"

    @patch("Controller.LoginController.Account.authenticate", side_effect=Exception("Invalid credentials"))
    def test_login_wrong_password(self, mock_auth):
        """Wrong password raises an exception — controller does not swallow it."""
        from Controller.LoginController import LoginController
        ctrl = LoginController()
        with pytest.raises(Exception, match="Invalid credentials"):
            ctrl.Login("test@example.com", "WrongPass", 3, "127.0.0.1")

    @patch("Controller.LoginController.Account.authenticate", side_effect=Exception("User not found"))
    def test_login_nonexistent_user(self, mock_auth):
        """Non-existent email raises an exception."""
        from Controller.LoginController import LoginController
        ctrl = LoginController()
        with pytest.raises(Exception, match="User not found"):
            ctrl.Login("nobody@example.com", "Password@1", 3, "127.0.0.1")

    @patch("Controller.LoginController.Account.authenticate", side_effect=Exception("Role mismatch"))
    def test_login_wrong_role(self, mock_auth):
        """Correct credentials but wrong role raises an exception."""
        from Controller.LoginController import LoginController
        ctrl = LoginController()
        with pytest.raises(Exception, match="Role mismatch"):
            ctrl.Login("test@example.com", "Password@1", 99, "127.0.0.1")
