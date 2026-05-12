from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class GetFRADetailsController:
    def getActivity(self, activity_id: int, fundraiser_id: int):
        with get_db_connection() as conn:
            try:
                return FundraisingActivity.getByIdAndFundraiser(activity_id, fundraiser_id, conn)
            except Exception as e:
                print(e)
                raise
    def getActivityList(self, fundraiser_id : int):
        with get_db_connection() as conn:
            try:
                return FundraisingActivity.getFundRaiserActivitiesByFundRaiserId(fundraiser_id,conn)
            except Exception as e:
                print(e)
                raise      
