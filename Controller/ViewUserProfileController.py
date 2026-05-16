from Entity.Profile import Profile
from db import get_db_connection
class ViewUserProfileController:
    def __init__(self):
        pass
    def getUserProfilesAll(self):
            try:
                profile_list : list[Profile] = Profile.getAllProfiles()
                return profile_list
            except Exception as e:
                print(e)
                raise
    def getUserProfile(self, id : int):
            try:
                profile : Profile = Profile.getProfileById(id)
                return profile
            except Exception as e:
                print(e)
                raise
    def getUserProfileNameID(self, is_signup = True):
            try:
                profile_name_id_list = Profile.GetAllProfileNameAndId( is_signup)
                return profile_name_id_list
            except Exception as e:
                print(e)
                raise
        
        