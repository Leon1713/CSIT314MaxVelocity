import pytest
from unittest.mock import MagicMock, patch


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
