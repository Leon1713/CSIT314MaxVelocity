from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class CreateFRAController:
    def createActivity(self, fundraiser_id: int, title: str, service_type: str,
                       description: str, category_id: int, goal_amount: float,
                       start_date: str, end_date: str) -> bool:
            data = {
                "fundraiser_id": fundraiser_id,
                "category_id":   category_id,
                "campaign_title":   title,
                "description" : description,
                "service_type":  service_type,
                "goal_amount":   goal_amount,
                "start_date":    start_date,
                "end_date":      end_date,
            }
            try:
                FundraisingActivity.create(data)
            except Exception as e:
                print(e)
                raise
