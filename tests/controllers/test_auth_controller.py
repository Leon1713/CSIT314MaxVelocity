import pytest
from unittest.mock import MagicMock, patch, PropertyMock


class TestAuthController:

    @patch("Controller.AuthController.Account.getUsersById")
    @patch("Controller.AuthController.Session.getSessionBySessionId")
    def test_auth_session_valid(self, mock_session, mock_account_get, mock_account):
        """Valid session ID resolves to the correct Account."""
        from Controller.AuthController import AuthController
        sess = MagicMock()
        sess.user_id = 1
        mock_session.return_value = sess
        mock_account_get.return_value = mock_account

        ctrl = AuthController()
        result = ctrl.AuthSession("sess-abc")
        assert result.user_id == 1

    @patch("Controller.AuthController.Session.getSessionBySessionId", side_effect=Exception("not found"))
    def test_auth_session_invalid(self, mock_session):
        """Invalid session ID raises HTTPException 404."""
        from Controller.AuthController import AuthController
        from fastapi import HTTPException
        ctrl = AuthController()
        with pytest.raises(HTTPException) as exc_info:
            ctrl.AuthSession("bad-session")
        assert exc_info.value.status_code == 404

    @patch("Controller.AuthController.Profile.GetProfileByRoleId")
    def test_has_permissions_true(self, mock_profile, mock_account):
        """hasPermissions returns True when the profile attribute is truthy."""
        from Controller.AuthController import AuthController
        profile = MagicMock()
        profile.can_manage_donation = True
        mock_profile.return_value = profile

        ctrl = AuthController()
        result = ctrl.hasPermissions(mock_account, "can_manage_donation")
        assert result is True

    @patch("Controller.AuthController.Profile.GetProfileByRoleId")
    def test_has_permissions_false(self, mock_profile, mock_account):
        """hasPermissions returns False when the profile attribute is falsy."""
        from Controller.AuthController import AuthController
        profile = MagicMock()
        profile.can_manage_donation = False
        mock_profile.return_value = profile

        ctrl = AuthController()
        result = ctrl.hasPermissions(mock_account, "can_manage_donation")
        assert result is False
