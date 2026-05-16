from Entity.Profile import Profile
from db import get_db_connection
class UpdateProfileController:
    def __init__(self):
        pass
    def update(self, profile_id : int, profile_dict : dict):
            try:
                return Profile.update(profile_id, profile_dict)
            except Exception as e:
                print(e)
                raise  