from Entity.Profile import Profile
class UpdateProfileController:
    def __init__(self):
        pass
    def update(self, profile_id : int, profile_dict : dict):
        try:
            profile : Profile = Profile.getProfileById(profile_id)
            for key, value in profile_dict.items():
                setattr(profile, key, value)
            return profile.update()
        except Exception as e:
            print(e)
            raise  