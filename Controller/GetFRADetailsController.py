from Entity.FundraisingActivity import FundraisingActivity


class GetFRADetailsController:
    def getActivity(self, activity_id: int, fundraiser_id: int):
        try:
            return FundraisingActivity.getByIdAndFundraiser(activity_id, fundraiser_id)
        except Exception:
            raise
