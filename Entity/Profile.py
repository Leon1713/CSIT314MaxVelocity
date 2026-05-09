from Entity.DBHandler import DBHandler


class Profile(DBHandler):
    def __init__(self, role_id: str, role_name: str, 
                 description: str, 
                 can_access_admin_dashboard: bool, 
                 can_access_fr_dashboard: bool, 
                 can_access_donee_dashboard: bool, 
                 can_access_platform_mgt_dashboard: bool,
                 can_manage_user_profile: bool,
                 can_manage_user_account: bool,
                 can_manage_fr: bool,
                 can_view_fra: bool,
                 can_manage_fra_favourite: bool,
                 can_view_fr_analytics: bool,
                 can_manage_donation: bool,
                 can_manage_fra_category: bool,
                 can_generate_report: bool,):
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
    
    @staticmethod
    def GetProfileByRoleId(role_id : int) -> "Profile":
        db_cursor = Profile.db_connection.cursor(dictionary=True)
        try:
            db_cursor.execute("SELECT * FROM user_roles WHERE role_id = %s", (role_id,))
            profile_dict = db_cursor.fetchone()
            result = Profile(**profile_dict)
            return result
        except Exception as e:
            raise e
        finally:
            db_cursor.close()
            

            
             
        
        
        
        
        
        
        
