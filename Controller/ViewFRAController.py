from Entity.FundraisingActivity import FundraisingActivity

class ViewFRAController:
    def getActivity(self, activity_id: int, fundraiser_id: int):
        try:
            return FundraisingActivity.getByIdAndFundraiser(activity_id, fundraiser_id)
        except Exception as e:
            print(e)
            raise

    def getActivityList(self, fundraiser_id: int):
        try:
            return FundraisingActivity.getFundRaiserActivitiesByFundRaiserId(fundraiser_id)
        except Exception as e:
            print(e)
            raise

    def getAllActivities(self, page: int = 1, limit: int = 100):
        try:
            return FundraisingActivity.getAllFundRaisingActivities(page, limit)
        except Exception as e:
            print(e)
            raise

    def getActivityByFRAId(self, act_id: int):
        try:
            return FundraisingActivity.getFundRaisingActivityById(act_id)
        except Exception as e:
            print(e)
            raise
    def doneeSearchFRA(self, keyword, category_id, date_from, date_to):
        try:
            return FundraisingActivity.searchFRA(keyword,category_id,date_from,date_to)
        except Exception as e:
            print(e)
            raise