from Entity.FundraisingActivity import FundraisingActivity
from db import get_db_connection

class RecordFRAViewController:
    def recordView(self, activity_id: int) -> None:
        with get_db_connection() as conn:
            FundraisingActivity.incrementViewCount(activity_id, conn)
