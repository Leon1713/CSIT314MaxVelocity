import datetime

from fastapi import APIRouter, Depends, HTTPException
from Controller.SearchFRAController import SearchFRAController
from Controller.ViewFRAController import ViewFRAController
from Controller.DonationController import DonationController
from Controller.FavoriteController import FavoriteController
from Dependencies.Auth import require_permission
from Entity.Account import Account

def require_donee(user=Depends(require_permission("can_access_donee_dashboard"))):
    return user

router = APIRouter(prefix="/donee", dependencies=[Depends(require_donee)])


# --- FRA ---
@router.get("/fundraising_activities", dependencies=[Depends(require_permission("can_view_fra"))])
def get_fra_list(keyword="", category_id="", date_from="", date_to=""):
    controller = SearchFRAController()
    try:
        fras = controller.doneeSearchFRA(keyword,category_id,date_from,date_to)
        return fras
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
def get_fra_list():
    controller = ViewFRAController()
    fras = controller.getAllActivities()
    return fras

@router.get("/fundraising_activities/{fra_id}", dependencies=[Depends(require_permission("can_view_fra"))])
def get_fra(fra_id: int):
    controller = ViewFRAController()
    fra = controller.getActivityByFRAId(fra_id)
    if fra is None:
        raise HTTPException(status_code=404, detail="Fundraising activity not found")
    return fra


# --- Donations ---


@router.get("/donations")
def get_donations(user=Depends(require_permission("can_manage_donation"))):
    controller = DonationController()
    donations = controller.getDonations(user.user_id)
    return donations

@router.post("/donations/{fra_id}") # might implement stripe
def make_donation(fra_id, amount, user : Account = Depends(require_permission("can_manage_donation"))):
    controller = DonationController()
    try:
        controller.makeDonation(user.user_id, fra_id, amount)
        return {"success": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to make donation")


# --- Favorites ---
@router.get("/favorites")
def get_favorites(user=Depends(require_permission("can_manage_fra_favourite"))):
    controller = FavoriteController()
    favs = controller.getFavorites(user.user_id)
    return [f.to_dict() for f in favs]

@router.post("/favorites/{fra_id}")
def add_favorite(fra_id: int, user=Depends(require_permission("can_manage_fra_favourite"))):
    controller = FavoriteController()
    try:
        controller.addFavorite(user.user_id, fra_id)
        return {"success": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to add favourite")

@router.delete("/favorites/{fra_id}")
def remove_favorite(fra_id: int, user=Depends(require_permission("can_manage_fra_favourite"))):
    controller = FavoriteController()
    try:
        controller.removeFavorite(user.user_id, fra_id)
        return {"success": True}
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to remove favourite")