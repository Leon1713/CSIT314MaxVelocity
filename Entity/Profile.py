from __future__ import annotations
class Profile:
    def __init__(self,
                 role_id: str, role_name: str,
                 description: str,
                 can_access_admin_dashboard: bool = False,
                 can_access_fr_dashboard: bool = False,
                 can_access_donee_dashboard: bool = False,
                 can_access_platform_mgt_dashboard: bool = False,

                 can_manage_user_profile: bool = False,
                 can_manage_user_account: bool = False,
                 can_manage_fr: bool = False,
                 can_view_fra: bool = False,
                 can_manage_fra_favourite: bool = False,
                 can_view_fr_analytics: bool = False,
                 can_manage_donation: bool = False,
                 can_manage_fra_category: bool = False,
                 can_generate_report: bool = False,
                 is_active : bool = True):
        self.role_id = role_id
        self.role_name = role_name
        self.role_desc = description
        self.can_access_admin_dashboard = can_access_admin_dashboard
        self.can_access_fr_dashboard = can_access_fr_dashboard
        self.can_access_donee_dashboard = can_access_donee_dashboard
        self.can_access_platform_mgt_dashboard = can_access_platform_mgt_dashboard
        self.can_manage_user_profile = can_manage_user_profile
        self.can_manage_user_account = can_manage_user_account
        self.can_manage_fr = can_manage_fr
        self.can_view_fra = can_view_fra
        self.can_manage_fra_favourite = can_manage_fra_favourite
        self.can_view_fr_analytics = can_view_fr_analytics
        self.can_manage_donation = can_manage_donation
        self.can_manage_fra_category = can_manage_fra_category
        self.can_generate_report = can_generate_report
        self.is_active = is_active

    _KNOWN_FIELDS = {
        "role_id", "role_name", "description",
        "can_access_admin_dashboard", "can_access_fr_dashboard",
        "can_access_donee_dashboard", "can_access_platform_mgt_dashboard",
        "can_manage_user_profile", "can_manage_user_account",
        "can_manage_fr", "can_view_fra", "can_manage_fra_favourite",
        "can_view_fr_analytics", "can_manage_donation",
        "can_manage_fra_category", "can_generate_report", "is_active",
    }

    @staticmethod
    def GetProfileByRoleId(role_id: int, conn) -> Profile:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute(
                "SELECT * FROM user_roles WHERE role_id = %s", (role_id,))
            profile_dict = db_cursor.fetchone()
            # Filter to only fields Profile.__init__ accepts — extra DB columns cause TypeError
            filtered = {k: v for k, v in profile_dict.items() if k in Profile._KNOWN_FIELDS}
            result = Profile(**filtered)
            return result
        except Exception as e:
            raise e
        finally:
            db_cursor.close()

    def to_dict(self):
        return {
            "id": self.role_id,
            "role_name": self.role_name,
            "description": self.role_desc,
            "can_access_admin_dashboard": self.can_access_admin_dashboard,
            "can_access_fr_dashboard": self.can_access_fr_dashboard,
            "can_access_donee_dashboard": self.can_access_donee_dashboard,
            "can_access_platform_mgt_dashboard": self.can_access_platform_mgt_dashboard,
            "can_manage_user_profile": self.can_manage_user_profile,
            "can_manage_user_account": self.can_manage_user_account,
            "can_manage_fr": self.can_manage_fr,
            "can_view_fra": self.can_view_fra,
            "can_manage_fra_favourite": self.can_manage_fra_favourite,
            "can_view_fr_analytics": self.can_view_fr_analytics,
            "can_manage_donation": self.can_manage_donation,
            "can_manage_fra_category": self.can_manage_fra_category,
            "can_generate_report": self.can_generate_report,
        }

    @staticmethod
    def insertProfile(profile: dict, conn) -> bool:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        data = profile
        values = (
            data["role_name"],
            data["description"],
            data["can_access_admin_dashboard"],
            data["can_access_fr_dashboard"],
            data["can_access_donee_dashboard"],
            data["can_access_platform_mgt_dashboard"],
            data["can_manage_user_profile"],
            data["can_manage_user_account"],
            data["can_manage_fr"],
            data["can_view_fra"],
            data["can_manage_fra_favourite"],
            data["can_view_fr_analytics"],
            data["can_manage_donation"],
            data["can_manage_fra_category"],
            data["can_generate_report"],
            data.get("is_active",True)
        )
        try:
            db_cursor.execute("""
            INSERT INTO user_roles (
    role_name,
    description,
    can_access_admin_dashboard,
    can_access_fr_dashboard,
    can_access_donee_dashboard,
    can_access_platform_mgt_dashboard,
    can_manage_user_profile,
    can_manage_user_account,
    can_manage_fr,
    can_view_fra,
    can_manage_fra_favourite,
    can_view_fr_analytics,
    can_manage_donation,
    can_manage_fra_category,
    can_generate_report,
    is_active
)
VALUES (
    %s, %s,
    %s, %s, %s, %s,
    %s, %s, %s, %s,
    %s, %s, %s, %s, %s,
    %s
)
""", values)
            db_conn.commit()
            return True
        except Exception as e:
            raise
        finally:
            db_cursor.close()

    @staticmethod
    def getAllProfiles(conn) -> list[Profile]:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("SELECT * FROM user_roles")
            profiles = db_cursor.fetchall()
            list_profiles: list[Profile] = [
                Profile(**profile) for profile in profiles]
            return list_profiles
        except Exception as e:
            raise
        finally:
            db_cursor.close()

    @staticmethod
    def getProfileById(id: int, conn):
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute(
                "SELECT * FROM user_roles WHERE role_id = %s", (id,))
        except Exception as e:
            print(e.msg)
            raise
        finally:
            db_cursor.close()

    def update(self, conn) -> bool:
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            params = {
                "role_id": self.role_id,
                "role_name": self.role_name,
                "description": self.role_desc,
                "can_access_admin_dashboard": self.can_access_admin_dashboard,
                "can_access_fr_dashboard": self.can_access_fr_dashboard,
                "can_access_donee_dashboard": self.can_access_donee_dashboard,
                "can_access_platform_mgt_dashboard": self.can_access_platform_mgt_dashboard,
                "can_manage_user_profile": self.can_manage_user_profile,
                "can_manage_user_account": self.can_manage_user_account,
                "can_manage_fr": self.can_manage_fr,
                "can_view_fra": self.can_view_fra,
                "can_manage_fra_favourite": self.can_manage_fra_favourite,
                "can_view_fr_analytics": self.can_view_fr_analytics,
                "can_manage_donation": self.can_manage_donation,
                "can_manage_fra_category": self.can_manage_fra_category,
                "can_generate_report": self.can_generate_report
            }
            db_cursor.execute
            ("""
             UPDATE roles
                SET
                    role_name = %(role_name)s,
                    description = %(description)s,
                    can_access_admin_dashboard = %(can_access_admin_dashboard)s,
                    can_access_fr_dashboard = %(can_access_fr_dashboard)s,
                    can_access_donee_dashboard = %(can_access_donee_dashboard)s,
                    can_access_platform_mgt_dashboard = %(can_access_platform_mgt_dashboard)s,
                    can_manage_user_profile = %(can_manage_user_profile)s,
                    can_manage_user_account = %(can_manage_user_account)s,
                    can_manage_fr = %(can_manage_fr)s,
                    can_view_fra = %(can_view_fra)s,
                    can_manage_fra_favourite = %(can_manage_fra_favourite)s,
                    can_view_fr_analytics = %(can_view_fr_analytics)s,
                    can_manage_donation = %(can_manage_donation)s,
                    can_manage_fra_category = %(can_manage_fra_category)s,
                    can_generate_report = %(can_generate_report)s
                WHERE role_id = %(role_id)s""",
                params)
            db_conn.commit()
            return True
        except Exception as e:
            print(f"Error updating Profile: {e}")
            db_conn.rollback()
            raise Exception(
                "Error updating Profile with profile id = %s", (self.role_id,))
        finally:
            db_cursor.close()

    @staticmethod
    def suspend(profile_id: int, conn) -> bool:
        try:
            db_conn = conn
            db_cursor = db_conn.cursor(dictionary=True)
            db_cursor.execute("""UPDATE user_roles SET is_active = 0 WHERE role_id = %s""",(profile_id,))
            db_conn.commit()
            return True
        except Exception as e:
            print(f"Error suspending Profile: {e}")
            db_conn.rollback()
            raise
        finally:
            db_cursor.close()
            