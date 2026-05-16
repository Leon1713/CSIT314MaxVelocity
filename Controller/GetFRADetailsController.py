from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class GetFRADetailsController:
    def getActivity(self, activity_id: int, fundraiser_id: int):
            try:
                return FundraisingActivity.getByIdAndFundraiser(activity_id, fundraiser_id)
            except Exception as e:
                print(e)
                raise
    def getActivityList(self, fundraiser_id : int):
            try:
                return FundraisingActivity.getFundRaiserActivitiesByFundRaiserId(fundraiser_id)
            except Exception as e:
                print(e)
                raise
    def getAllActivities(self, page : int = 1, limit : int = 100):
            try:
                return FundraisingActivity.getAllFundRaisingActivities(page, limit)
            except Exception as e:
                print(e)
                raise
    def getActivityByFRAId(self, act_id : int):
            try:
                return FundraisingActivity.getFundRaisingActivityById(act_id)
            except Exception as e:
                print(e)
                raise
            
