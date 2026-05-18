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

