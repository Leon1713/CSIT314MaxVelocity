import pytest
from unittest.mock import MagicMock, patch


class TestSignupController:

    @patch("Controller.signupController.Account.insertNewUser", return_value=True)
    @patch("Controller.signupController.Account.getRoleId", return_value=3)
    def test_signup_success(self, mock_role, mock_insert):
        """Valid registration data returns success."""
        from Controller.signupController import signupController
        ctrl = signupController()
        result = ctrl.signupUser(
            email="new@example.com", user="newuser",
            pw="Secure@123", roles="donee",
            first_name="New", last_name="User", phone="98765432"
        )
        assert result["success"] is True

    @patch("Controller.signupController.Account.insertNewUser", return_value=False)
    @patch("Controller.signupController.Account.getRoleId", return_value=3)
    def test_signup_duplicate_username(self, mock_role, mock_insert):
        """Duplicate username/email causes insert to return False → error dict."""
        from Controller.signupController import signupController
        ctrl = signupController()
        result = ctrl.signupUser(
            email="dup@example.com", user="existinguser",
            pw="Secure@123", roles="donee"
        )
        assert result["success"] is False
        assert "already exists" in result["error"]

    @patch("Controller.signupController.Account.getRoleId", side_effect=ValueError("Role 'ghost' not found"))
    def test_signup_invalid_role(self, mock_role):
        """Invalid role name returns a failure dict, not an unhandled exception."""
        from Controller.signupController import signupController
        ctrl = signupController()
        result = ctrl.signupUser(
            email="x@example.com", user="xuser",
            pw="Secure@123", roles="ghost"
        )
        assert result["success"] is False
        assert "ghost" in result["error"]

    @patch("Controller.signupController.Account.insertNewUser", side_effect=Exception("DB down"))
    @patch("Controller.signupController.Account.getRoleId", return_value=3)
    def test_signup_db_error(self, mock_role, mock_insert):
        """Unexpected DB error returns generic failure dict."""
        from Controller.signupController import signupController
        ctrl = signupController()
        result = ctrl.signupUser(
            email="err@example.com", user="erruser", pw="Secure@123", roles="donee"
        )
        assert result["success"] is False
        assert "unexpected" in result["error"].lower()
