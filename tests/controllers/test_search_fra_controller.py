import pytest
from unittest.mock import MagicMock, patch
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
