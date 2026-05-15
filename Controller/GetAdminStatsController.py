from Entity.Account import Account
from db import get_db_connection
class GetAdminStatsController:
    def __init__(self):
        pass
    
    def getStats(self):
        with get_db_connection() as db_conn:
            try:
                return Account.getRecentUpdatesAndLogin(5,db_conn)
            except Exception as e:
                print(e)
                raise
    def getOverviewStats(self):
        with get_db_connection() as conn:
            try:
                return Account.getAdminDashboardStats(conn)
            except Exception as e:
                print(e)
                raise        