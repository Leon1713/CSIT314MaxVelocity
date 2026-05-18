import pytest
from unittest.mock import MagicMock, patch


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
