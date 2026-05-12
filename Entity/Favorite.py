from .DBHandler import DBHandler

class Favorite(DBHandler):
    def __init__(self, id, donee_id, fra_id, created_at):
        super().__init__()
        self.id = id
        self.donee_id = donee_id
        self.fra_id = fra_id
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "donee_id": self.donee_id,
            "fra_id": self.fra_id,
            "created_at": str(self.created_at),
        }

    @staticmethod
    def getByDoneeId(donee_id: int):
        cursor = Favorite.db_connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM favorites WHERE donee_id = %s", (donee_id,))
            rows = cursor.fetchall()
            return [Favorite(**row) for row in rows]
        finally:
            cursor.close()

    @staticmethod
    def create(donee_id: int, fra_id: int):
        cursor = Favorite.db_connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "INSERT INTO favorites (donee_id, fra_id) VALUES (%s, %s)",
                (donee_id, fra_id)
            )
            Favorite.db_connection.commit()
            return True
        except Exception:
            Favorite.db_connection.rollback()
            raise
        finally:
            cursor.close()

    @staticmethod
    def delete(donee_id: int, fra_id: int):
        cursor = Favorite.db_connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "DELETE FROM favorites WHERE donee_id = %s AND fra_id = %s",
                (donee_id, fra_id)
            )
            Favorite.db_connection.commit()
            return True
        except Exception:
            Favorite.db_connection.rollback()
            raise
        finally:
            cursor.close()