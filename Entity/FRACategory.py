from __future__ import annotations

class FRACategory:
    def __init__(self, id, category_name, category_description, is_active, created_at, updated_at):
        super().__init__()
        self.id = id
        self.category_name = category_name
        self.category_description = category_description
        self.is_active = is_active
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "category_name": self.category_name,
            "category_description": self.category_description,
        }

    @staticmethod
    def getById(category_id: int, conn):
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT fc.*, COUNT(fa.id) AS campaign_count
                FROM fra_categories fc
                LEFT JOIN fundraising_activities fa ON fc.id = fa.category_id
                WHERE fc.id = %s
                GROUP BY fc.id
            """, (category_id,))
            return db_cursor.fetchone()
        finally:
            db_cursor.close()

    @staticmethod
    def getAllWithCampaignCount(conn) -> list:
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT fc.id, fc.category_name, fc.category_description,
                       fc.is_active, fc.created_at,
                       COUNT(fa.id) AS campaign_count
                FROM fra_categories fc
                LEFT JOIN fundraising_activities fa ON fc.id = fa.category_id
                GROUP BY fc.id
                ORDER BY fc.id
            """)
            return db_cursor.fetchall()
        finally:
            db_cursor.close()

    @staticmethod
    def create(data: dict, conn) -> bool:
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                INSERT INTO fra_categories (category_name, category_description, is_active)
                VALUES (%s, %s, %s)
            """, (data["category_name"], data.get("category_description"), data.get("is_active", 1)))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            db_cursor.close()

    @staticmethod
    def updateById(category_id: int, data: dict, conn) -> bool:
        db_cursor = conn.cursor(dictionary=True)
        field_map = {
            "category_name":        "category_name",
            "category_description": "category_description",
            "is_active":            "is_active",
        }
        set_parts = ["updated_at = NOW()"]
        values = []
        for key, col in field_map.items():
            if key in data and data[key] is not None:
                set_parts.append(f"{col} = %s")
                values.append(data[key])
        values.append(category_id)
        try:
            db_cursor.execute(
                f"UPDATE fra_categories SET {', '.join(set_parts)} WHERE id = %s", values
            )
            conn.commit()
            return db_cursor.rowcount > 0
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            db_cursor.close()

    @staticmethod
    def deleteById(category_id: int, conn) -> bool:
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute("DELETE FROM fra_categories WHERE id = %s", (category_id,))
            conn.commit()
            return db_cursor.rowcount > 0
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            db_cursor.close()

    @staticmethod
    def getAll(conn) -> list:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT id, category_name, category_description
                FROM fra_categories
                WHERE is_active = 1
                ORDER BY category_name
            """)
            return db_cursor.fetchall()
        finally:
            db_cursor.close()
            
