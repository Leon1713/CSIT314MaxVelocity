from Entity.Profile import Profile
class SuspendUserProfileController:
    def __init__(self):
        pass
    def suspend(self, profile_id : int):
        try:
            return Profile.suspend(profile_id)
        except Exception as e:
            print(e)
            raise