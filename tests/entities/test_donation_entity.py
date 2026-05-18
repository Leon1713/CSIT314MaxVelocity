import pytest
from unittest.mock import MagicMock, patch
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
