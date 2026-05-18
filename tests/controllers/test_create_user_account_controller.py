import pytest
from unittest.mock import MagicMock, patch

class TestCreateUserAccountController:

    @patch("Controller.CreateUserAccountController.Account.insertNewUser", return_value=True)
    def test_create_account_success(self, mock_insert):
        """Admin creates an account successfully."""
        from Controller.CreateUserAccountController import CreateUserAccountController
        ctrl = CreateUserAccountController()
        result = ctrl.createAccount(
            username="adminmade", password="Admin@123",
            email="admin@made.com", role_id=2,
            first_name="Admin", last_name="Made", phone="81234567"
        )
        assert result["success"] is True

    @patch("Controller.CreateUserAccountController.Account.insertNewUser", return_value=False)
    def test_create_account_insert_fails(self, mock_insert):
        """Insert returning False produces a failure dict."""
        from Controller.CreateUserAccountController import CreateUserAccountController
        ctrl = CreateUserAccountController()
        result = ctrl.createAccount(
            username="dup", password="Admin@123",
            email="dup@made.com", role_id=2,
            first_name="Dup", last_name="User", phone=""
        )
        assert result["success"] is False

    @patch("Controller.CreateUserAccountController.Account.insertNewUser", side_effect=ValueError("bad data"))
    def test_create_account_value_error(self, mock_insert):
        """ValueError from entity is caught and returned as failure dict."""
        from Controller.CreateUserAccountController import CreateUserAccountController
        ctrl = CreateUserAccountController()
        result = ctrl.createAccount(
            username="bad", password="", email="bad@made.com",
            role_id=99, first_name="", last_name="", phone=""
        )
        assert result["success"] is False
        assert "bad data" in result["error"]
