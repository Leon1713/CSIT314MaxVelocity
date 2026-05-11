from Entity.Profile import Profile
class ViewUserProfileController:
    def __init__(self):
        pass
    def getUserProfilesAll():
        try:
            profile_list : list[Profile] = Profile.getAllProfiles()
            return profile_list
        except Exception as e:
            print(e.msg)
            raise
    def getUserProfile(id : int):
        try:
            profile : Profile = Profile.getProfileById(id)
            return profile
        except Exception as e:
            print(e.msg)
            raise
        
        