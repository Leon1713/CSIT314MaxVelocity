from __future__ import annotations
from db import get_db_connection

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
        self.goal_amount = float(
            goal_amount) if goal_amount is not None else 0.0
        self.current_amount = float(
            current_amount) if current_amount is not None else 0.0
        self.status = status
        self.start_date = start_date
        self.end_date = end_date
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "fundraiser_id": self.fundraiser_id,
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
    def getStatsByFundraiserId(fundraiser_id: int) -> dict:
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT
                    COUNT(*) AS total_activities,
                    SUM(CASE WHEN status = 1 OR LOWER(CAST(status AS CHAR)) = 'active' THEN 1 ELSE 0 END) AS active_activities,
                    COALESCE(SUM(current_amount), 0) AS total_raised
                FROM fundraising_activities
                WHERE fundraiser_id = %s
            """, (fundraiser_id,))
            row = db_cursor.fetchone()
            return {
                "total_activities": int(row["total_activities"] or 0),
                "active_activities": int(row["active_activities"] or 0),
                "total_raised": float(row["total_raised"] or 0),
                "donor_count": 0,
            }
        except Exception as e:
            print(f"getStatsByFundraiserId error: {e}")
            return {"total_activities": 0, "active_activities": 0, "total_raised": 0, "donor_count": 0}
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def create(data: dict) -> bool:
        conn = get_db_connection()
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                INSERT INTO fundraising_activities
                    (fundraiser_id, category_id,campaign_title, description, service_type,
                     goal_amount, current_amount, status, start_date, end_date)
                VALUES (%s, %s, %s, %s, %s,%s, 0, 1, NOW(), %s)
            """, (
                data["fundraiser_id"],
                data["category_id"],
                data["campaign_title"],
                data["description"],
                data["service_type"],
                data["goal_amount"],
                data["end_date"],
            ))
            db_cursor.execute("""
                INSERT IGNORE INTO fra_stats (fra_id, view_count, shortlist_count)
                VALUES (LAST_INSERT_ID(), 0, 0)
            """)
            db_conn.commit()
            return True
        except Exception as e:
            db_conn.rollback()
            raise e
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def deleteById(activity_id: int, fundraiser_id: int) -> bool:
        db_conn = get_db_connection()
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
            db_conn.close()

    @staticmethod
    def getByIdAndFundraiser(activity_id: int, fundraiser_id: int):
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT fa.*, fc.category_name,
                       COALESCE(fs.view_count, 0)      AS view_count,
                       COALESCE(fs.shortlist_count, 0) AS shortlist_count
                FROM fundraising_activities fa
                LEFT JOIN fra_categories fc ON fa.category_id = fc.id
                LEFT JOIN fra_stats fs ON fa.id = fs.fra_id
                WHERE fa.id = %s AND fa.fundraiser_id = %s
            """, (activity_id, fundraiser_id))
            return db_cursor.fetchone()
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def updateById(activity_id: int, fundraiser_id: int, data: dict) -> bool:
        conn = get_db_connection()
        db_cursor = conn.cursor(dictionary=True)
        field_map = {
            "title":        "campaign_title",
            "description": "description",
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
            conn.close()

    @staticmethod
    def getAllByFundraiserId(fundraiser_id: int) -> list:
        conn = get_db_connection()
        db_cursor = conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT fa.id, fa.description, fa.campaign_title, fa.service_type, fa.status,
                       fa.current_amount, fa.goal_amount, fa.end_date, fa.created_at,
                       COALESCE(fs.view_count, 0)      AS view_count,
                       COALESCE(fs.shortlist_count, 0) AS shortlist_count,
                       fc.category_name
                FROM fundraising_activities fa
                LEFT JOIN fra_categories fc ON fa.category_id = fc.id
                LEFT JOIN fra_stats fs ON fa.id = fs.fra_id
                WHERE fa.fundraiser_id = %s
                ORDER BY fa.created_at DESC
            """, (fundraiser_id,))
            return db_cursor.fetchall()
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def incrementViewCount(activity_id: int) -> None:
        conn = get_db_connection()
        db_cursor = conn.cursor()
        try:
            db_cursor.execute("""
                INSERT INTO fra_stats (fra_id, view_count, shortlist_count)
                VALUES (%s, 1, 0)
                ON DUPLICATE KEY UPDATE view_count = view_count + 1
            """, (activity_id,))
            conn.commit()
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def getCompletedByFundraiserId(fundraiser_id: int, filters: dict) -> list:
        conn = get_db_connection()
        db_cursor = conn.cursor(dictionary=True)
        try:
            conditions = [
                "fa.fundraiser_id = %s",
                "(fa.status = 0 OR LOWER(CAST(fa.status AS CHAR)) = 'inactive' OR fa.end_date < CURDATE())"
            ]
            params = [fundraiser_id]

            if filters.get("keyword"):
                conditions.append("(fa.description LIKE %s OR fa.service_type LIKE %s)")
                kw = f"%{filters['keyword']}%"
                params.extend([kw, kw])

            if filters.get("category_id"):
                conditions.append("fa.category_id = %s")
                params.append(filters["category_id"])

            if filters.get("date_from"):
                conditions.append("fa.end_date >= %s")
                params.append(filters["date_from"])

            if filters.get("date_to"):
                conditions.append("fa.end_date <= %s")
                params.append(filters["date_to"])

            db_cursor.execute(f"""
                SELECT fa.id, fa.description, fa.service_type, fa.status,
                       fa.current_amount, fa.goal_amount, fa.start_date, fa.end_date,
                       COALESCE(fs.view_count, 0)      AS view_count,
                       COALESCE(fs.shortlist_count, 0) AS shortlist_count,
                       fc.category_name
                FROM fundraising_activities fa
                LEFT JOIN fra_categories fc ON fa.category_id = fc.id
                LEFT JOIN fra_stats fs ON fa.id = fs.fra_id
                WHERE {' AND '.join(conditions)}
                ORDER BY fa.end_date DESC
            """, params)
            return db_cursor.fetchall()
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def getRecentByFundraiserId(fundraiser_id: int, limit: int = 5) -> list:
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                SELECT fa.id, fa.campaign_title, fa.description,fc.category_name, fa.service_type, fa.status, fa.created_at
                FROM fundraising_activities fa LEFT JOIN
                fra_categories fc ON fa.category_id = fc.id
                WHERE fundraiser_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            """, (fundraiser_id, limit))
            return db_cursor.fetchall()
        except Exception as e:
            print(f"getRecentByFundraiserId error: {e}")
            return []
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def getFundRaiserActivitiesByFundRaiserId(user_id: int):
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
            SELECT * FROM fundraising_activities
            WHERE fundraiser_id = %s
            ORDER BY created_at DESC
            """, (user_id,))
            return db_cursor.fetchall()
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def getAllFundRaisingActivities(pages: int, limitPerPage: int):
        offset = (pages - 1) * limitPerPage
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                              SELECT * FROM fundraising_activities
                              ORDER BY created_at DESC
                              LIMIT %s OFFSET %s
                              """, (limitPerPage, offset,))
            return db_cursor.fetchall()
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            db_conn.close()
    @staticmethod
    def getFundRaisingActivityById(fra_id : int):
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                              SELECT * FROM fundraising_activities
                              WHERE id = %s
                              """, (fra_id,))
            return db_cursor.fetchone()
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            db_conn.close()
