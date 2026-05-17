from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from Dependencies.Auth import require_permission
from Controller.GetPlatformStatsController import GetPlatformStatsController
from Controller.ViewCategoryController import ViewCategoryController
from Controller.CreateCategoryController import CreateCategoryController
from Controller.UpdateCategoryController import UpdateCategoryController
from Controller.DeleteCategoryController import DeleteCategoryController
from Controller.GetCategoryDetailsController import GetCategoryDetailsController
from Controller.SearchCategoryController import SearchCategoryController
from Controller.GetPlatformReportController import GetPlatformReportController


class CreateCategoryInput(BaseModel):
    category_name: str
    category_description: Optional[str] = None
    is_active: Optional[int] = 1


class UpdateCategoryInput(BaseModel):
    category_name: Optional[str] = None
    category_description: Optional[str] = None
    is_active: Optional[int] = None

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
                    "id":            act["id"],
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


@router.get("/report")
def get_platform_report(
    user: "Account" = Depends(require_permission("can_access_platform_mgt_dashboard")),
    period: str = "weekly",
):
    controller = GetPlatformReportController()
    try:
        data   = controller.getReport(period)
        stats  = data["stats"]
        recent = data["recent"] or []

        def norm_status(s):
            return 1 if (s == 1 or str(s).lower() == "active") else 0

        chart = data.get("chart_data") or []
        return {
            "username": user.username,
            "period":   period,
            "stats": {
                "new_campaigns":    int(stats["new_campaigns"]    or 0),
                "total_raised":     float(stats["total_raised"]   or 0),
                "activity_visits":  int(stats["activity_visits"]  or 0),
                "new_users":        int(stats["new_users"]        or 0),
                "active_campaigns": int(stats["active_campaigns"] or 0),
                "avg_raised":       float(stats["avg_raised"]     or 0),
            },
            "recent_activity": [
                {
                    "id":             act["id"],
                    "title":          act["description"],
                    "category_name":  act.get("category_name") or "—",
                    "service_type":   act.get("service_type")  or "—",
                    "status":         norm_status(act["status"]),
                    "current_amount": float(act["current_amount"] or 0),
                    "view_count":     int(act.get("view_count") or 0),
                    "created_at":     str(act["created_at"]) if act["created_at"] else None,
                }
                for act in recent
            ],
            "chart_data": [
                {"title": c["title"], "view_count": int(c["view_count"] or 0)}
                for c in chart
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/categories/search")
def search_categories(
    q: str = "",
    filter_status: str = "",
    _=Depends(require_permission("can_manage_fra_category"))
):
    ctrl = SearchCategoryController()
    try:
        cats = ctrl.search(q, filter_status)
        return {"categories": [
            {
                "id":                   c["id"],
                "category_name":        c["category_name"],
                "category_description": c.get("category_description") or "",
                "is_active":            bool(c["is_active"]),
                "campaign_count":       int(c["campaign_count"] or 0),
                "created_at":           str(c["created_at"]) if c["created_at"] else None,
            }
            for c in (cats or [])
        ]}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/categories/{category_id}")
def get_category(
    category_id: int,
    _=Depends(require_permission("can_manage_fra_category"))
):
    ctrl = GetCategoryDetailsController()
    try:
        cat = ctrl.getCategory(category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return {
            "id":                   cat["id"],
            "category_name":        cat["category_name"],
            "category_description": cat.get("category_description") or "",
            "is_active":            bool(cat["is_active"]),
            "campaign_count":       int(cat["campaign_count"] or 0),
            "created_at":           str(cat["created_at"])  if cat["created_at"]  else None,
            "updated_at":           str(cat["updated_at"])  if cat["updated_at"]  else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/categories")
def get_categories(_=Depends(require_permission("can_manage_fra_category"))):
    ctrl = ViewCategoryController()
    try:
        cats = ctrl.getAll()
        return {"categories": [
            {
                "id":                   c["id"],
                "category_name":        c["category_name"],
                "category_description": c.get("category_description") or "",
                "is_active":            bool(c["is_active"]),
                "campaign_count":       int(c["campaign_count"] or 0),
                "created_at":           str(c["created_at"]) if c["created_at"] else None,
            }
            for c in (cats or [])
        ]}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/categories")
def create_category(
    data: CreateCategoryInput,
    _=Depends(require_permission("can_manage_fra_category"))
):
    ctrl = CreateCategoryController()
    try:
        ctrl.create(data.model_dump())
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/categories/{category_id}")
def update_category(
    category_id: int,
    data: UpdateCategoryInput,
    _=Depends(require_permission("can_manage_fra_category"))
):
    ctrl = UpdateCategoryController()
    try:
        success = ctrl.update(category_id, data.model_dump(exclude_none=True))
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    _=Depends(require_permission("can_manage_fra_category"))
):
    ctrl = DeleteCategoryController()
    try:
        success = ctrl.delete(category_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
