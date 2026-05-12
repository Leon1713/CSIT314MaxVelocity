from .DBHandler import DBHandler

class Donation(DBHandler):
    def __init__(self, id, donee_id, fra_id, amount, created_at):
        super().__init__()
        self.id = id
        self.donee_id = donee_id
        self.fra_id = fra_id
        self.amount = amount
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "donee_id": self.donee_id,
            "fra_id": self.fra_id,
            "amount": float(self.amount),
            "created_at": str(self.created_at),
        }

    @staticmethod
    def getByDoneeId(donee_id: int):
        cursor = Donation.db_connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM donations WHERE donee_id = %s", (donee_id,))
            rows = cursor.fetchall()
            return [Donation(**row) for row in rows]
        finally:
            cursor.close()

    @staticmethod
    def create(donee_id: int, fra_id: int, amount: float):
        cursor = Donation.db_connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "INSERT INTO donations (donee_id, fra_id, amount) VALUES (%s, %s, %s)",
                (donee_id, fra_id, amount)
            )
            Donation.db_connection.commit()
            return True
        except Exception:
            Donation.db_connection.rollback()
            raise
        finally:
            cursor.close()