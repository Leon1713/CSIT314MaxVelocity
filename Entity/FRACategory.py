from Entity.DBHandler import DBHandler


class FRACategory(DBHandler):
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
    def getAll() -> list:
        db_cursor = FRACategory.db_connection.cursor(dictionary=True)
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
