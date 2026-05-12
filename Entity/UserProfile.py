from db import get_db_connection


class UserProfile:
    def __init__(self, profile_id, user_id, bio, profile_picture,
                 address, city, country, created_at):
        self.profile_id     = profile_id
        self.user_id        = user_id
        self.bio            = bio
        self.profile_picture = profile_picture
        self.address        = address
        self.city           = city
        self.country        = country
        self.created_at     = created_at

    @staticmethod
    def getByUserId(user_id: int, conn):
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute(
                "SELECT * FROM user_profiles WHERE user_id = %s", (user_id,)
            )
            return db_cursor.fetchone()
        finally:
            db_cursor.close()

    @staticmethod
    def upsert(user_id: int, data: dict, conn) -> bool:
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                INSERT INTO user_profiles (user_id, bio, address, city, country)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    bio     = VALUES(bio),
                    address = VALUES(address),
                    city    = VALUES(city),
                    country = VALUES(country)
            """, (
                user_id,
                data.get("bio"),
                data.get("address"),
                data.get("city"),
                data.get("country"),
            ))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            db_cursor.close()
