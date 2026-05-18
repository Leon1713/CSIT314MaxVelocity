import pytest
from unittest.mock import MagicMock, patch


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
