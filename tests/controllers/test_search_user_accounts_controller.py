import pytest
from unittest.mock import MagicMock, patch


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
