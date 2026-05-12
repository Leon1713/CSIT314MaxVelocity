from Entity.Profile import Profile
from db import get_db_connection
class UpdateProfileController:
    def __init__(self):
        pass
    def update(self, profile_id : int, profile_dict : dict):
        with get_db_connection() as db_con:
            try:
                profile : Profile = Profile.getProfileById(profile_id, db_con)
                for key, value in profile_dict.items():
                    setattr(profile, key, value)
                return profile.update(db_con)
            except Exception as e:
                print(e)
                raise  