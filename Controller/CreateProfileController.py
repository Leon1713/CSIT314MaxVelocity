from Entity.Profile import Profile
from db import get_db_connection

class CreateProfileController:
    def __init__(self):
        pass
    def createProfile(self, profileInput) ->bool:
        with get_db_connection() as conn:
            temp = Profile(None, **profileInput)
            temp.can_access_admin_dashboard = temp.can_manage_user_profile or temp.can_manage_user_account
            temp.can_access_donee_dashboard = temp.can_manage_fra_favourite or temp.can_view_fra or temp.can_manage_donation
            temp.can_access_fr_dashboard = temp.can_manage_fr or temp.can_view_fr_analytics or temp.can_view_fra
            temp.can_access_platform_mgt_dashboard = temp.can_manage_fra_category or temp.can_generate_report
            temp = temp.to_dict()
            try:
                return Profile.insertProfile(temp,conn)
            except Exception as e:
                raise e