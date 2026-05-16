from Entity.Donation import Donation
from db import get_db_connection
class DonationController:
    def __init__(self):
        pass

    def getDonations(self, donee_id: int):
            return Donation.getByDoneeId(donee_id)

    def makeDonation(self, donee_id: int, fra_id: int, amount: float):
            return Donation.create(donee_id, fra_id, amount)