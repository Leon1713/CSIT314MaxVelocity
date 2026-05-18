"""
pytest test suite for CSIT314 MaxVelocity – Fundly
====================================================
Run from the project root:
    pytest tests/test_fundly.py -v

All DB calls are mocked via unittest.mock so no live database is required.
"""

import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from passlib.context import CryptContext

# ─────────────────────────────────────────────────────────────────────────────
# Shared fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture
def pwd_context():
    return CryptContext(schemes=["argon2"], deprecated="auto")


@pytest.fixture
def mock_account():
    """A minimal Account-like object used wherever a logged-in user is needed."""
    acc = MagicMock()
    acc.user_id      = 1
    acc.username     = "test_user"
    acc.email        = "test@example.com"
    acc.role_id      = 3          # donee
    acc.first_name   = "Test"
    acc.last_name    = "User"
    acc.phone        = "91234567"
    acc.is_active    = True
    acc.is_suspended = False
    return acc


@pytest.fixture
def mock_fra():
    """Minimal FRA row dict returned by DB cursor."""
    return {
        "id": 10,
        "fundraiser_id": 5,
        "category_id": 2,
        "campaign_title": "Save the Trees",
        "description": "A campaign to plant trees",
        "service_type": "Environment",
        "goal_amount": 5000.0,
        "current_amount": 1500.0,
        "status": 1,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "created_at": "2024-01-01 00:00:00",
        "updated_at": "2024-01-01 00:00:00",
        "category_name": "Environment",
    }


@pytest.fixture
def mock_donation():
    return {
        "id": 1,
        "donee_id": 1,
        "fra_id": 10,
        "amount": 50.0,
        "created_at": "2024-06-01 10:00:00",
    }


# ═════════════════════════════════════════════════════════════════════════════
# 1. LOGIN CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 2. SIGNUP CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 3. CREATE USER ACCOUNT CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 4. SUSPEND USER ACCOUNT CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 5. SEARCH USER ACCOUNTS CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

class TestSearchUserAccountsController:

    @patch("Controller.SearchUserAccountsController.Account.search")
    def test_search_returns_results(self, mock_search, mock_account):
        """Search with a keyword returns matching accounts."""
        from Controller.SearchUserAccountsController import SearchUserAccountsController
        mock_search.return_value = [mock_account]
        ctrl = SearchUserAccountsController()
        result = ctrl.search("test", is_active=True)
        assert len(result) == 1
        mock_search.assert_called_once_with("test", True)

    @patch("Controller.SearchUserAccountsController.Account.search", return_value=[])
    def test_search_no_results(self, mock_search):
        """Search with no matches returns an empty list."""
        from Controller.SearchUserAccountsController import SearchUserAccountsController
        ctrl = SearchUserAccountsController()
        result = ctrl.search("nobody", is_active=True)
        assert result == []

    @patch("Controller.SearchUserAccountsController.Account.search", side_effect=Exception("DB error"))
    def test_search_db_error(self, mock_search):
        """DB error propagates out of the controller."""
        from Controller.SearchUserAccountsController import SearchUserAccountsController
        ctrl = SearchUserAccountsController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.search("error", is_active=True)


# ═════════════════════════════════════════════════════════════════════════════
# 6. UPDATE USER ACCOUNT CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 7. CREATE FRA CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 8. SEARCH FRA CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

class TestSearchFRAController:

    @patch("Controller.SearchFRAController.FundraisingActivity.searchByFundraiserId")
    def test_search_fra_by_fundraiser(self, mock_search, mock_fra):
        """Fundraiser search delegates to entity with correct args."""
        from Controller.SearchFRAController import SearchFRAController
        mock_search.return_value = [mock_fra]
        ctrl = SearchFRAController()
        result = ctrl.search(fundraiser_id=5, q="trees", filter_status="1")
        assert len(result) == 1
        mock_search.assert_called_once_with(5, "trees", "1")

    @patch("Controller.SearchFRAController.FundraisingActivity.searchFRA")
    def test_donee_search_fra(self, mock_search, mock_fra):
        """Donee FRA search delegates with all four filter params."""
        from Controller.SearchFRAController import SearchFRAController
        mock_search.return_value = [mock_fra]
        ctrl = SearchFRAController()
        result = ctrl.doneeSearchFRA("trees", 2, "2024-01-01", "2024-12-31")
        assert len(result) == 1
        mock_search.assert_called_once_with("trees", 2, "2024-01-01", "2024-12-31")

    @patch("Controller.SearchFRAController.FundraisingActivity.searchByFundraiserId", return_value=[])
    def test_search_fra_no_results(self, mock_search):
        """Empty result set is returned as-is."""
        from Controller.SearchFRAController import SearchFRAController
        ctrl = SearchFRAController()
        result = ctrl.search(99, q="nonexistent")
        assert result == []

    @patch("Controller.SearchFRAController.FundraisingActivity.searchFRA", side_effect=Exception("DB error"))
    def test_donee_search_fra_db_error(self, mock_search):
        """DB error propagates from doneeSearchFRA."""
        from Controller.SearchFRAController import SearchFRAController
        ctrl = SearchFRAController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.doneeSearchFRA("trees", None, "", "")


# ═════════════════════════════════════════════════════════════════════════════
# 9. VIEW FRA CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 10. DELETE FRA CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 11. DONATION CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

class TestDonationController:

    @patch("Controller.DonationController.Donation.getByDoneeId")
    def test_get_donations_returns_list(self, mock_get, mock_donation):
        """getDonations returns the list from the entity."""
        from Controller.DonationController import DonationController
        mock_get.return_value = [mock_donation]
        ctrl = DonationController()
        result = ctrl.getDonations(1)
        assert len(result) == 1
        assert result[0]["fra_id"] == 10
        mock_get.assert_called_once_with(1)

    @patch("Controller.DonationController.Donation.getByDoneeId", return_value=[])
    def test_get_donations_empty(self, mock_get):
        """No donations returns empty list."""
        from Controller.DonationController import DonationController
        ctrl = DonationController()
        result = ctrl.getDonations(99)
        assert result == []

    @patch("Controller.DonationController.Donation.create", return_value=True)
    def test_make_donation_success(self, mock_create):
        """Successful donation creation returns True."""
        from Controller.DonationController import DonationController
        ctrl = DonationController()
        result = ctrl.makeDonation(donee_id=1, fra_id=10, amount=50.0)
        assert result is True
        mock_create.assert_called_once_with(1, 10, 50.0)

    @patch("Controller.DonationController.Donation.create", side_effect=Exception("DB error"))
    def test_make_donation_db_error(self, mock_create):
        """DB error propagates out of makeDonation."""
        from Controller.DonationController import DonationController
        ctrl = DonationController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.makeDonation(1, 10, 50.0)

    @patch("Controller.DonationController.Donation.create", return_value=True)
    def test_make_donation_zero_amount(self, mock_create):
        """Zero amount is passed through — validation is the route layer's job."""
        from Controller.DonationController import DonationController
        ctrl = DonationController()
        result = ctrl.makeDonation(1, 10, 0.0)
        assert result is True


# ═════════════════════════════════════════════════════════════════════════════
# 12. FAVORITE CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

class TestFavoriteController:

    @patch("Controller.FavoriteController.Favorite.getByDoneeId")
    def test_get_favorites(self, mock_get):
        """getFavorites delegates to Favorite entity."""
        from Controller.FavoriteController import FavoriteController
        fav = MagicMock()
        fav.fra_id = 10
        mock_get.return_value = [fav]
        ctrl = FavoriteController()
        result = ctrl.getFavorites(1)
        assert len(result) == 1
        mock_get.assert_called_once_with(1)

    @patch("Controller.FavoriteController.Favorite.create", return_value=True)
    def test_add_favorite(self, mock_create):
        """addFavorite calls Favorite.create with correct args."""
        from Controller.FavoriteController import FavoriteController
        ctrl = FavoriteController()
        result = ctrl.addFavorite(1, 10)
        assert result is True
        mock_create.assert_called_once_with(1, 10)

    @patch("Controller.FavoriteController.Favorite.delete", return_value=True)
    def test_remove_favorite(self, mock_delete):
        """removeFavorite calls Favorite.delete with correct args."""
        from Controller.FavoriteController import FavoriteController
        ctrl = FavoriteController()
        result = ctrl.removeFavorite(1, 10)
        assert result is True
        mock_delete.assert_called_once_with(1, 10)

    @patch("Controller.FavoriteController.Favorite.create", side_effect=Exception("duplicate"))
    def test_add_duplicate_favorite(self, mock_create):
        """Adding the same FRA twice raises an exception (DB unique constraint)."""
        from Controller.FavoriteController import FavoriteController
        ctrl = FavoriteController()
        with pytest.raises(Exception, match="duplicate"):
            ctrl.addFavorite(1, 10)

    @patch("Controller.FavoriteController.Favorite.delete", return_value=False)
    def test_remove_nonexistent_favorite(self, mock_delete):
        """Removing a favourite that doesn't exist returns False."""
        from Controller.FavoriteController import FavoriteController
        ctrl = FavoriteController()
        result = ctrl.removeFavorite(1, 999)
        assert result is False


# ═════════════════════════════════════════════════════════════════════════════
# 13. CREATE CATEGORY CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

class TestCreateCategoryController:

    @patch("Controller.CreateCategoryController.FRACategory.create", return_value=True)
    def test_create_category_success(self, mock_create):
        """Valid category data creates successfully."""
        from Controller.CreateCategoryController import CreateCategoryController
        ctrl = CreateCategoryController()
        result = ctrl.create({"category_name": "Education", "category_description": "Edu campaigns", "is_active": 1})
        assert result is True
        mock_create.assert_called_once()

    @patch("Controller.CreateCategoryController.FRACategory.create", side_effect=Exception("duplicate name"))
    def test_create_duplicate_category(self, mock_create):
        """Duplicate category name raises an exception."""
        from Controller.CreateCategoryController import CreateCategoryController
        ctrl = CreateCategoryController()
        with pytest.raises(Exception, match="duplicate name"):
            ctrl.create({"category_name": "Education"})

    @patch("Controller.CreateCategoryController.FRACategory.create", side_effect=Exception("DB error"))
    def test_create_category_db_error(self, mock_create):
        """DB error propagates."""
        from Controller.CreateCategoryController import CreateCategoryController
        ctrl = CreateCategoryController()
        with pytest.raises(Exception, match="DB error"):
            ctrl.create({"category_name": "New"})


# ═════════════════════════════════════════════════════════════════════════════
# 14. GET USER PROFILE CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 15. AUTH CONTROLLER
# ═════════════════════════════════════════════════════════════════════════════

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


# ═════════════════════════════════════════════════════════════════════════════
# 16. ENTITY — Account.to_dict
# ═════════════════════════════════════════════════════════════════════════════

class TestAccountEntity:

    def test_to_dict_contains_all_fields(self):
        """to_dict returns all expected keys."""
        from Entity.Account import Account
        acc = Account(1, "user", "u@e.com", "hash", 3,
                      "First", "Last", "91234567", True, False,
                      "2024-01-01", "2024-01-01", None)
        d = acc.to_dict()
        for key in ("user_id", "username", "email", "password_hash",
                    "role_id", "first_name", "last_name", "phone",
                    "is_active", "is_suspended"):
            assert key in d

    def test_to_dict_values_correct(self):
        """to_dict values match constructor arguments."""
        from Entity.Account import Account
        acc = Account(7, "jy", "jy@e.com", "hashed", 2,
                      "Jia", "Yuan", "81234567", True, False,
                      None, None, None)
        d = acc.to_dict()
        assert d["user_id"] == 7
        assert d["username"] == "jy"
        assert d["role_id"] == 2


# ═════════════════════════════════════════════════════════════════════════════
# 17. ENTITY — Donation.to_dict
# ═════════════════════════════════════════════════════════════════════════════

class TestDonationEntity:

    def test_to_dict_amount_is_float(self):
        """amount is always returned as float in to_dict."""
        from Entity.Donation import Donation
        d = Donation(1, 1, 10, "50.00", "2024-01-01 10:00:00")
        result = d.to_dict()
        assert isinstance(result["amount"], float)
        assert result["amount"] == 50.0

    def test_to_dict_all_keys_present(self):
        """to_dict contains all five expected keys."""
        from Entity.Donation import Donation
        d = Donation(2, 3, 5, 100.0, "2024-06-01")
        result = d.to_dict()
        for key in ("id", "donee_id", "fra_id", "amount", "created_at"):
            assert key in result


# ═════════════════════════════════════════════════════════════════════════════
# 18. ENTITY — Favorite.to_dict
# ═════════════════════════════════════════════════════════════════════════════

class TestFavoriteEntity:

    def test_to_dict_all_keys(self):
        """Favorite.to_dict returns id, donee_id, fra_id, created_at."""
        from Entity.Favorite import Favorite
        fav = Favorite(1, 2, 10, "2024-01-01 00:00:00")
        d = fav.to_dict()
        for key in ("id", "donee_id", "fra_id", "created_at"):
            assert key in d
        assert d["fra_id"] == 10


# ═════════════════════════════════════════════════════════════════════════════
# 19. EDGE CASES — password hashing
# ═════════════════════════════════════════════════════════════════════════════

class TestPasswordHashing:

    def test_hashed_password_is_not_plaintext(self, pwd_context):
        """Hashed password does not equal the original plaintext."""
        plain = "MySecret@123"
        hashed = pwd_context.hash(plain)
        assert hashed != plain

    def test_correct_password_verifies(self, pwd_context):
        """Correct password verifies against its hash."""
        plain = "MySecret@123"
        hashed = pwd_context.hash(plain)
        assert pwd_context.verify(plain, hashed) is True

    def test_wrong_password_fails_verification(self, pwd_context):
        """Wrong password does not verify."""
        hashed = pwd_context.hash("MySecret@123")
        assert pwd_context.verify("WrongPass@1", hashed) is False

    def test_two_hashes_of_same_password_differ(self, pwd_context):
        """Argon2 uses a random salt so two hashes of the same input are different."""
        plain = "MySecret@123"
        assert pwd_context.hash(plain) != pwd_context.hash(plain)