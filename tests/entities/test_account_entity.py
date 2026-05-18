import pytest
from unittest.mock import MagicMock, patch

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
