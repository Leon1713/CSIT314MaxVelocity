from Entity.UserProfile import UserProfile
from db import get_db_connection


class UpdateUserProfileController:
    def updateProfile(self, user_id: int, data: dict):
        account_cols  = {"first_name", "last_name", "phone", "email"}
        account_data  = {k: v for k, v in data.items() if k in account_cols}
        profile_data  = {k: v for k, v in data.items() if k not in account_cols}

        with get_db_connection() as conn:
            try:
                if account_data:
                    cursor = conn.cursor(dictionary=True)
                    set_parts = [f"{col} = %s" for col in account_data]
                    cursor.execute(
                        f"UPDATE user_accounts SET {', '.join(set_parts)}, updated_at = NOW() WHERE user_id = %s",
                        list(account_data.values()) + [user_id]
                    )
                    conn.commit()
                    cursor.close()

                if profile_data:
                    UserProfile.upsert(user_id, profile_data, conn)

            except Exception:
                raise
