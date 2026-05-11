from Entity.FundraisingActivity import FundraisingActivity


class CreateFRAController:
    def createActivity(self, fundraiser_id: int, title: str, service_type: str,
                       category_id: int, goal_amount: float,
                       start_date: str, end_date: str) -> bool:
        data = {
            "fundraiser_id": fundraiser_id,
            "description":   title,
            "service_type":  service_type,
            "category_id":   category_id,
            "goal_amount":   goal_amount,
            "start_date":    start_date,
            "end_date":      end_date,
        }
        FundraisingActivity.create(data)
