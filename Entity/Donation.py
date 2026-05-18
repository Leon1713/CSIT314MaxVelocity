from __future__ import annotations
from db import get_db_connection


class Donation:
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
        """Fetch all donations for a donee, ordered newest first."""
        db_conn = get_db_connection()
        cursor = db_conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM donations WHERE donee_id = %s ORDER BY created_at DESC",
                (donee_id,)
            )
            rows = cursor.fetchall()
            for row in rows:
                if row.get("created_at") is not None:
                    row["created_at"] = str(row["created_at"])
                if row.get("amount") is not None:
                    row["amount"] = float(row["amount"])
            return rows
        finally:
            cursor.close()
            db_conn.close()

    @staticmethod
    def create(donee_id: int, fra_id: int, amount: float):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "INSERT INTO donations (donee_id, fra_id, amount) VALUES (%s, %s, %s)",
                (donee_id, fra_id, amount)
            )
            conn.commit()
            return True
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
            conn.close()