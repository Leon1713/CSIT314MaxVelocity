from __future__ import annotations

class PlatformReport:

    _PERIOD_SQL = {
        "daily":   "CURDATE()",
        "weekly":  "DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
        "monthly": "DATE_SUB(CURDATE(), INTERVAL 30 DAY)",
    }

    @staticmethod
    def getReportStats(period: str, conn) -> dict:
        cursor = conn.cursor(dictionary=True)
        since = PlatformReport._PERIOD_SQL.get(period, "DATE_SUB(CURDATE(), INTERVAL 7 DAY)")
        try:
            cursor.execute(f"""
                SELECT
                    (SELECT COUNT(*)
                     FROM fundraising_activities
                     WHERE created_at >= {since})                                          AS new_campaigns,
                    (SELECT COALESCE(SUM(current_amount), 0)
                     FROM fundraising_activities
                     WHERE created_at >= {since})                                          AS total_raised,
                    (SELECT COALESCE(SUM(view_count), 0)
                     FROM fra_stats)                                                       AS activity_visits,
                    (SELECT COUNT(*)
                     FROM user_accounts
                     WHERE created_at >= {since} AND is_suspended = 0)                    AS new_users,
                    (SELECT COUNT(*)
                     FROM fundraising_activities
                     WHERE status = 1 OR LOWER(CAST(status AS CHAR)) = 'active')          AS active_campaigns,
                    (SELECT COALESCE(AVG(current_amount), 0)
                     FROM fundraising_activities
                     WHERE created_at >= {since})                                          AS avg_raised
            """)
            return cursor.fetchone()
        finally:
            cursor.close()

    @staticmethod
    def getViewsByCategory(conn, limit: int = 8) -> list:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT fc.category_name AS title,
                       COALESCE(SUM(fs.view_count), 0) AS view_count
                FROM fra_categories fc
                LEFT JOIN fundraising_activities fa ON fc.id = fa.category_id
                LEFT JOIN fra_stats fs ON fa.id = fs.fra_id
                GROUP BY fc.id, fc.category_name
                ORDER BY view_count DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        finally:
            cursor.close()

    @staticmethod
    def getRecentFRAActivity(period: str, conn, limit: int = 5) -> list:
        cursor = conn.cursor(dictionary=True)
        since = PlatformReport._PERIOD_SQL.get(period, "DATE_SUB(CURDATE(), INTERVAL 7 DAY)")
        try:
            cursor.execute(f"""
                SELECT fa.id, fa.description, fa.service_type, fa.status,
                       fa.current_amount, fa.goal_amount, fa.created_at,
                       fc.category_name,
                       COALESCE(fs.view_count, 0) AS view_count
                FROM fundraising_activities fa
                LEFT JOIN fra_categories fc ON fa.category_id = fc.id
                LEFT JOIN fra_stats fs ON fa.id = fs.fra_id
                WHERE fa.created_at >= {since}
                ORDER BY fa.created_at DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        finally:
            cursor.close()
