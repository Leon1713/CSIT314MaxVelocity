from db import get_db_connection


class PlatformStats:

    @staticmethod
    def getStats() -> dict:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT
                    (SELECT COUNT(*)          FROM fra_categories       WHERE is_active = 1)        AS total_categories,
                    (SELECT COUNT(*)          FROM fundraising_activities WHERE status = 1 OR LOWER(status) = 'active') AS active_campaigns,
                    (SELECT COALESCE(SUM(current_amount), 0) FROM fundraising_activities)           AS total_raised,
                    (SELECT COUNT(*)          FROM user_accounts        WHERE is_suspended = 0)      AS platform_users
            """)
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def getRecentCategoryActivity(limit: int = 6) -> list:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT id, category_name, is_active, created_at, updated_at
                FROM fra_categories
                ORDER BY GREATEST(created_at, IFNULL(updated_at, created_at)) DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

