from Entity.Donation import Donation
from db import get_db_connection
class DonationController:
    def __init__(self):
        pass

    def getDonations(self, donee_id: int):
        with get_db_connection() as conn:
            return Donation.getByDoneeId(donee_id, conn)

    def makeDonation(self, donee_id: int, fra_id: int, amount: float):
        with get_db_connection() as conn:
            return Donation.create(donee_id, fra_id, amount,conn)