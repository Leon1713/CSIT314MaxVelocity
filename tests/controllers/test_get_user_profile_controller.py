import pytest
from unittest.mock import MagicMock, patch


class TestGetUserProfileController:

    @patch("Controller.GetUserProfileController.UserProfile.getByUserId")
    def test_get_profile_with_profile_row(self, mock_get, mock_account):
        """Returns merged account + profile data when a profile row exists."""
        from Controller.GetUserProfileController import GetUserProfileController
        mock_get.return_value = {
            "bio": "I love giving",
            "address": "123 Main St",
            "city": "Singapore",
            "country": "Singapore",
            "profile_picture": None,
        }
        ctrl = GetUserProfileController()
        result = ctrl.getProfile(mock_account)
        assert result["username"] == "test_user"
        assert result["bio"] == "I love giving"
        assert result["city"] == "Singapore"
        assert result["profile_picture_url"] is None

    @patch("Controller.GetUserProfileController.UserProfile.getByUserId", return_value=None)
    def test_get_profile_no_profile_row(self, mock_get, mock_account):
        """Returns account data with empty strings when no profile row exists."""
        from Controller.GetUserProfileController import GetUserProfileController
        ctrl = GetUserProfileController()
        result = ctrl.getProfile(mock_account)
        assert result["username"] == "test_user"
        assert result["bio"] == ""
        assert result["city"] == ""

    @patch("Controller.GetUserProfileController.UserProfile.getByUserId")
    def test_get_profile_picture_url_built_correctly(self, mock_get, mock_account):
        """Profile picture URL is constructed using BASE_URL when picture exists."""
        from Controller.GetUserProfileController import GetUserProfileController
        mock_get.return_value = {
            "bio": "", "address": "", "city": "", "country": "",
            "profile_picture": "avatar.jpg",
        }
        ctrl = GetUserProfileController()
        result = ctrl.getProfile(mock_account)
        assert "avatar.jpg" in result["profile_picture_url"]
        assert result["profile_picture_url"].startswith("http")
