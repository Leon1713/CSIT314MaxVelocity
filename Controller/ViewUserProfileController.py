from Entity.Profile import Profile
from db import get_db_connection
class ViewUserProfileController:
    def __init__(self):
        pass
    def getUserProfilesAll(self):
        with get_db_connection() as db_conn:
            try:
                profile_list : list[Profile] = Profile.getAllProfiles(db_conn)
                return profile_list
            except Exception as e:
                print(e)
                raise
    def getUserProfile(self, id : int):
        with get_db_connection() as db_conn:
            try:
                profile : Profile = Profile.getProfileById(id, db_conn)
                return profile
            except Exception as e:
                print(e)
                raise
    def getUserProfileNameID(self, is_signup = True):
        with get_db_connection() as conn:
            try:
                profile_name_id_list = Profile.GetAllProfileNameAndId(conn, is_signup)
                return profile_name_id_list
            except Exception as e:
                print(e)
                raise
        
        