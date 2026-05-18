import pytest
from unittest.mock import MagicMock, patch


class TestFavoriteEntity:

    def test_to_dict_all_keys(self):
        """Favorite.to_dict returns id, donee_id, fra_id, created_at."""
        from Entity.Favorite import Favorite
        fav = Favorite(1, 2, 10, "2024-01-01 00:00:00")
        d = fav.to_dict()
        for key in ("id", "donee_id", "fra_id", "created_at"):
            assert key in d
        assert d["fra_id"] == 10
