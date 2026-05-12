from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from Dependencies.Auth import require_permission
from Controller.GetFundraiserStatsController import GetFundraiserStatsController
from Controller.CreateFRAController import CreateFRAController
from Controller.GetFRACategoriesController import GetFRACategoriesController
from Controller.GetFRADetailsController import GetFRADetailsController
from Controller.DeleteFRAController import DeleteFRAController

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from Entity.Account import Account


class CreateFRAInput(BaseModel):
    title: str
    service_type: str
    category_id: int
    goal_amount: float
    start_date: str
    end_date: str

router = APIRouter(
    prefix="/fundraiser",
    dependencies=[Depends(require_permission("can_access_fr_dashboard"))]
)


@router.get("/stats")
def get_fundraiser_stats(user: "Account" = Depends(require_permission("can_access_fr_dashboard"))):
    controller = GetFundraiserStatsController()
    try:
        stats = controller.getStats(user.user_id)
        recent = controller.getRecentActivities(user.user_id)
        return {
            "username": user.username,
            "stats": {
                "total_activities": int(stats["total_activities"] or 0),
                "active":           int(stats["active_activities"] or 0),
                "total_raised":     float(stats["total_raised"] or 0),
                "donors":           int(stats["donor_count"] or 0),
            },
            "recent_activities": [
                {
                    "id":          act["id"],
                    "description": act["description"],
                    "category":    act.get("service_type") or "—",
                    "status":      act["status"],
                    "created_at":  str(act["created_at"]),
                }
                for act in (recent or [])
            ]
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve fundraiser data"
        )


@router.get("/activity/{activity_id}")
def get_activity_details(
    activity_id: int,
    user: "Account" = Depends(require_permission("can_view_fr"))
):
    controller = GetFRADetailsController()
    try:
        activity = controller.getActivity(activity_id, user.user_id)
        if not activity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
        return {
            "id":            activity["id"],
            "title":         activity["description"],
            "category_name": activity.get("category_name") or "—",
            "service_type":  activity.get("service_type") or "—",
            "current_amount": float(activity["current_amount"] or 0),
            "goal_amount":    float(activity["goal_amount"] or 0),
            "status":         activity["status"],
            "start_date":     str(activity["start_date"]) if activity["start_date"] else None,
            "end_date":       str(activity["end_date"]) if activity["end_date"] else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/activity/{activity_id}")
def delete_activity(
    activity_id: int,
    user: "Account" = Depends(require_permission("can_manage_fr"))
):
    controller = DeleteFRAController()
    try:
        deleted = controller.deleteActivity(activity_id, user.user_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/categories") # move to unprotected route
def get_categories():
    controller = GetFRACategoriesController()
    try:
        return {"categories": controller.getCategories()}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/create_activity")
def create_activity(
    data: CreateFRAInput,
    user: "Account" = Depends(require_permission("can_manage_fr"))
):
    controller = CreateFRAController()
    try:
        controller.createActivity(
            fundraiser_id=user.user_id,
            title=data.title,
            service_type=data.service_type,
            category_id=data.category_id,
            goal_amount=data.goal_amount,
            start_date=data.start_date,
            end_date=data.end_date,
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
@router.get("/activity")
def get_activity_list_fr(
    user : Account = Depends(require_permission("can_view_fra"))
    ):
    controller = GetFRADetailsController()
    try:
        return controller.getActivityList(user.user_id)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="failed to find activities")
    