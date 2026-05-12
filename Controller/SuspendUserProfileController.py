from Entity.Profile import Profile
from db import get_db_connection
class SuspendUserProfileController:
    def __init__(self):
        pass
    def suspend(self, profile_id : int):
        with get_db_connection() as db_con:
            try:
                return Profile.suspend(profile_id, db_con)
            except Exception as e:
                print(e)
                raise