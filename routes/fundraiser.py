from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from Entity.Account import Account
from Dependencies.Auth import require_permission
from Controller.GetFundraiserStatsController import GetFundraiserStatsController
from Controller.CreateFRAController import CreateFRAController
from Controller.GetFRACategoriesController import GetFRACategoriesController
from Controller.GetFRADetailsController import GetFRADetailsController
from Controller.DeleteFRAController import DeleteFRAController
from Controller.GetAllFRAController import GetAllFRAController
from Controller.UpdateFRAController import UpdateFRAController
from Controller.RecordFRAViewController import RecordFRAViewController
from Controller.GetCompletedFRAController import GetCompletedFRAController

from typing import TYPE_CHECKING, Optional
if TYPE_CHECKING:
    from Entity.Account import Account


class CreateFRAInput(BaseModel):
    title: str
    service_type: str
    category_id: int
    description: str
    goal_amount: float
    start_date: str
    end_date: str

class UpdateFRAInput(BaseModel):
    title: Optional[str] = None
    service_type: Optional[str] = None
    
    category_id: Optional[int] = None
    goal_amount: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[int] = None

router = APIRouter(
    prefix="/fundraiser",
    dependencies=[Depends(require_permission("can_access_fr_dashboard"))]
)

def _norm_status(raw) -> int:
    if isinstance(raw, int):
        return raw
    s = str(raw).lower()
    return 1 if s in ('active', '1') else 0


@router.get("/stats")
def get_fundraiser_stats(user: "Account" = Depends(require_permission("can_access_fr_dashboard"))):
    controller = GetFundraiserStatsController()
    fid = user.user_id
    try:
        stats  = controller.getStats(fid) or {}
        recent = controller.getRecentActivities(fid, limit=5) or []
        return {
            "username": user.username,
            "stats": {
                "total_activities": int(stats.get("total_activities") or 0),
                "active":           int(stats.get("active_activities") or 0),
                "total_raised":     float(stats.get("total_raised") or 0),
                "donors":           int(stats.get("donor_count") or 0),
            },
            "recent_activities": [
                {
                    "id":          act["id"],
                    "title":        act["campaign_title"],
                    "description": act["description"],
                    "category":    act.get("service_type") or "—",
                    "status":      _norm_status(act["status"]),
                    "created_at":  str(act["created_at"]),
                }
                for act in (recent or [])
            ]
        }
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve fundraiser data"
        )


@router.get("/activities")
def get_all_activities(user: "Account" = Depends(require_permission("can_access_fr_dashboard"))):
    controller = GetAllFRAController()
    fid = user.user_id
    try:
        activities = controller.getAllActivities(fid)
        return {
            "username": user.username,
            "activities": [
                {
                    "id":              act["id"],
                    "title":           act["description"],
                    "category_name":   act.get("category_name") or "—",
                    "current_amount":  float(act["current_amount"] or 0),
                    "goal_amount":     float(act["goal_amount"] or 0),
                    "status":          _norm_status(act["status"]),
                    "end_date":        str(act["end_date"]) if act["end_date"] else None,
                    "view_count":      int(act.get("view_count") or 0),
                    "shortlist_count": int(act.get("shortlist_count") or 0),
                }
                for act in (activities or [])
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/activity/{activity_id}")
def get_activity_details(
    activity_id: int,
    user: "Account" = Depends(require_permission("can_view_fra"))
):
    controller = GetFRADetailsController()
    fid = user.user_id
    try:
        activity = controller.getActivity(activity_id, fid)
        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
        return {
            "id":              activity["id"],
            "title":           activity["description"],
            "category_id":     activity.get("category_id"),
            "category_name":   activity.get("category_name") or "—",
            "service_type":    activity.get("service_type") or "—",
            "current_amount":  float(activity["current_amount"] or 0),
            "goal_amount":     float(activity["goal_amount"] or 0),
            "status":          _norm_status(activity["status"]),
            "start_date":      str(activity["start_date"]) if activity["start_date"] else None,
            "end_date":        str(activity["end_date"]) if activity["end_date"] else None,
            "view_count":      int(activity.get("view_count") or 0),
            "shortlist_count": int(activity.get("shortlist_count") or 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/activity/{activity_id}")
def update_activity(
    activity_id: int,
    data: UpdateFRAInput,
    user: "Account" = Depends(require_permission("can_manage_fr"))
):
    controller = UpdateFRAController()
    fid = user.user_id
    try:
        success = controller.updateActivity(
            activity_id, fid, data.model_dump(exclude_none=True)
        )
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
        return {"success": True}
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
    fid = user.user_id
    try:
        deleted = controller.deleteActivity(activity_id, fid)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/activity/{activity_id}/view")
def record_activity_view(
    activity_id: int,
    user: "Account" = Depends(require_permission("can_access_fr_dashboard"))
):
    controller = RecordFRAViewController()
    try:
        controller.recordView(activity_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/completed_activities")
def get_completed_activities(
    user: "Account" = Depends(require_permission("can_access_fr_dashboard")),
    keyword: Optional[str] = None,
    category_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    controller = GetCompletedFRAController()
    fid = user.user_id
    try:
        filters = {
            "keyword":     keyword,
            "category_id": category_id,
            "date_from":   date_from,
            "date_to":     date_to,
        }
        activities = controller.getCompleted(fid, filters) or []
        return {
            "username": user.username,
            "activities": [
                {
                    "id":              act["id"],
                    "title":           act["description"],
                    "category_name":   act.get("category_name") or "—",
                    "service_type":    act.get("service_type") or "—",
                    "current_amount":  float(act["current_amount"] or 0),
                    "goal_amount":     float(act["goal_amount"] or 0),
                    "status":          _norm_status(act["status"]),
                    "start_date":      str(act["start_date"]) if act["start_date"] else None,
                    "end_date":        str(act["end_date"]) if act["end_date"] else None,
                    "view_count":      int(act.get("view_count") or 0),
                    "shortlist_count": int(act.get("shortlist_count") or 0),
                }
                for act in activities
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/categories")
def get_categories():
    controller = GetFRACategoriesController()
    try:
        return {"categories": controller.getCategories()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


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
            description=data.description,
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
    user: Account = Depends(require_permission("can_view_fra"))
):
    controller = GetFRADetailsController()
    try:
        return controller.getActivityList(user.user_id)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="failed to find activities")
