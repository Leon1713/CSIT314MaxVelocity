from fastapi import APIRouter, Depends, HTTPException, status
from Dependencies.Auth import require_permission
from Controller.GetPlatformStatsController import GetPlatformStatsController

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from Entity.Account import Account

router = APIRouter(
    prefix="/platform",
    dependencies=[Depends(require_permission("can_access_platform_mgt_dashboard"))]
)


@router.get("/stats")
def get_platform_stats(
    user: "Account" = Depends(require_permission("can_access_platform_mgt_dashboard"))
):
    controller = GetPlatformStatsController()
    try:
        stats  = controller.getStats()
        recent = controller.getRecentActivity()
        return {
            "username": user.username,
            "stats": {
                "total_categories": int(stats["total_categories"] or 0),
                "active_campaigns": int(stats["active_campaigns"]  or 0),
                "total_raised":     float(stats["total_raised"]    or 0),
                "platform_users":   int(stats["platform_users"]    or 0),
            },
            "recent_activity": [
                {
                    "category_name": act["category_name"],
                    "is_active":     bool(act["is_active"]),
                    "created_at":    str(act["created_at"])  if act["created_at"]  else None,
                    "updated_at":    str(act["updated_at"])  if act["updated_at"]  else None,
                }
                for act in (recent or [])
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
