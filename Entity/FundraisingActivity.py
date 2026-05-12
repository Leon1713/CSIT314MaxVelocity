from __future__ import annotations
class FundraisingActivity():
    def __init__(self, id, fundraiser_id, category_id, description,
                 service_type, goal_amount, current_amount, status,
                 start_date, end_date, created_at, updated_at):
        super().__init__()
        self.id = id
        self.fundraiser_id = fundraiser_id
        self.category_id = category_id
        self.description = description
        self.service_type = service_type
        self.goal_amount = float(goal_amount) if goal_amount is not None else 0.0
        self.current_amount = float(current_amount) if current_amount is not None else 0.0
        self.status = status
        self.start_date = start_date
        self.end_date = end_date
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "fundraiser_id": self.fundraiser_id,
            "donee_id": self.donee_id,
            "category_id": self.category_id,
            "description": self.description,
            "service_type": self.service_type,
            "goal_amount": self.goal_amount,
            "current_amount": self.current_amount,
            "status": self.status,
            "start_date": str(self.start_date) if self.start_date else None,
            "end_date": str(self.end_date) if self.end_date else None,
            "created_at": str(self.created_at) if self.created_at else None,
            "updated_at": str(self.updated_at) if self.updated_at else None,
        }

    @staticmethod
    def getStatsByFundraiserId(fundraiser_id: int, conn) -> dict:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT
                    COUNT(fundraising_activities.id)                                              AS total_activities,
                    SUM(CASE WHEN fundraising_activities.status = 1 THEN 1 ELSE 0 END)   AS active_activities,
                    COALESCE(SUM(fundraising_activities.current_amount), 0)                       AS total_raised,
                    COUNT(DISTINCT donations.donee_id)                               AS donor_count
                FROM fundraising_activities LEFT JOIN donations
                ON fundraising_activities.id = donations.fra_id
                WHERE fundraising_activities.fundraiser_id = %s
            """, (fundraiser_id,))
            return db_cursor.fetchone()
        except Exception  as e:
            print(e)
        finally:
            db_cursor.close()

    @staticmethod
    def create(data: dict, conn) -> bool:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                INSERT INTO fundraising_activities
                    (fundraiser_id, category_id, description, service_type,
                     goal_amount, current_amount, status, start_date, end_date)
                VALUES (%s, %s, %s, %s, %s, 0, 1, NOW(), %s)
            """, (
                data["fundraiser_id"],
                data["category_id"],
                data["description"],
                data["service_type"],
                data["goal_amount"],
                data["end_date"],
            ))
            db_conn.commit()
            return True
        except Exception as e:
            db_conn.rollback()
            raise e
        finally:
            db_cursor.close()

    @staticmethod
    def deleteById(activity_id: int, fundraiser_id: int, conn) -> bool:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                DELETE FROM fundraising_activities
                WHERE id = %s AND fundraiser_id = %s
            """, (activity_id, fundraiser_id))
            db_conn.commit()
            return db_cursor.rowcount > 0
        except Exception as e:
            db_conn.rollback()
            raise e
        finally:
            db_cursor.close()

    @staticmethod
    def getByIdAndFundraiser(activity_id: int, fundraiser_id: int, conn):
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT fa.*, fc.category_name
                FROM fundraising_activities fa
                LEFT JOIN fra_categories fc ON fa.category_id = fc.id
                WHERE fa.id = %s AND fa.fundraiser_id = %s
            """, (activity_id, fundraiser_id))
            return db_cursor.fetchone()
        finally:
            db_cursor.close()

    @staticmethod
    def updateById(activity_id: int, fundraiser_id: int, data: dict, conn) -> bool:
        db_cursor = conn.cursor(dictionary=True)
        field_map = {
            "title":        "description",
            "service_type": "service_type",
            "category_id":  "category_id",
            "goal_amount":  "goal_amount",
            "start_date":   "start_date",
            "end_date":     "end_date",
            "status":       "status",
        }
        set_parts = ["updated_at = NOW()"]
        values = []
        for key, col in field_map.items():
            if key in data and data[key] is not None:
                set_parts.append(f"{col} = %s")
                values.append(data[key])
        values.extend([activity_id, fundraiser_id])
        try:
            db_cursor.execute(
                f"UPDATE fundraising_activities SET {', '.join(set_parts)} WHERE id = %s AND fundraiser_id = %s",
                values
            )
            conn.commit()
            return db_cursor.rowcount > 0
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            db_cursor.close()

    @staticmethod
    def getAllByFundraiserId(fundraiser_id: int, conn) -> list:
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT fa.id, fa.description, fa.service_type, fa.status,
                       fa.current_amount, fa.goal_amount, fa.end_date, fa.created_at,
                       fc.category_name
                FROM fundraising_activities fa
                LEFT JOIN fra_categories fc ON fa.category_id = fc.id
                WHERE fa.fundraiser_id = %s
                ORDER BY fa.created_at DESC
            """, (fundraiser_id,))
            return db_cursor.fetchall()
        finally:
            db_cursor.close()

    @staticmethod
    def getRecentByFundraiserId(fundraiser_id: int, conn, limit: int = 5, ) -> list:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT id, description, service_type, status, created_at
                FROM fundraising_activities
                WHERE fundraiser_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            """, (fundraiser_id, limit))
            return db_cursor.fetchall()
        finally:
            db_cursor.close()
