import pytest
from unittest.mock import MagicMock, patch


class TestUpdateUserAccountController:

    @patch("Controller.UpdateUserAccountController.Account.update", return_value=True)
    def test_update_email(self, mock_update):
        """Updating email calls Account.update with the right key."""
        from Controller.UpdateUserAccountController import UpdateUserAccountController
        ctrl = UpdateUserAccountController()
        result = ctrl.updateUserAccount(1, {"email": "new@email.com"})
        assert result is True
        mock_update.assert_called_once()

    @patch("Controller.UpdateUserAccountController.Account.update", return_value=True)
    def test_update_password_is_hashed(self, mock_update):
        """Password field is renamed to password_hash and the value is hashed."""
        from Controller.UpdateUserAccountController import UpdateUserAccountController
        ctrl = UpdateUserAccountController()
        ctrl.updateUserAccount(1, {"password": "NewPass@1"})
        call_args = mock_update.call_args[0]
        update_dict = call_args[1]
        assert "password_hash" in update_dict
        assert "password" not in update_dict

    @patch("Controller.UpdateUserAccountController.Account.update", side_effect=Exception("constraint"))
    def test_update_db_error_propagates(self, mock_update):
        """DB error is not swallowed."""
        from Controller.UpdateUserAccountController import UpdateUserAccountController
        ctrl = UpdateUserAccountController()
        with pytest.raises(Exception, match="constraint"):
            ctrl.updateUserAccount(1, {"email": "bad"})
