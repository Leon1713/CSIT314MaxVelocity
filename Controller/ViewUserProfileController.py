from Entity.Profile import Profile
from db import get_db_connection
class ViewUserProfileController:
    def __init__(self):
        pass
    def getUserProfilesAll():
        with get_db_connection() as db_conn:
            try:
                profile_list : list[Profile] = Profile.getAllProfiles(db_conn)
                return profile_list
            except Exception as e:
                print(e.msg)
                raise
    def getUserProfile(id : int):
        with get_db_connection() as db_conn:
            try:
                profile : Profile = Profile.getProfileById(id, db_conn)
                return profile
            except Exception as e:
                print(e.msg)
                raise
        
        