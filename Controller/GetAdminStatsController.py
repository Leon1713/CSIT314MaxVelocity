from Entity.Account import Account
from db import get_db_connection
class GetAdminStatsController:
    def __init__(self):
        pass
    
    def getStats(self):
            try:
                return Account.getRecentUpdatesAndLogin(5)
            except Exception as e:
                print(e)
                raise
    def getOverviewStats(self):
            try:
                return Account.getAdminDashboardStats()
            except Exception as e:
                print(e)
                raise        