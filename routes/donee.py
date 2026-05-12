from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from Controller.ViewFRAController import ViewFRAController
from Controller.DonationController import DonationController
from Controller.FavoriteController import FavoriteController
from Dependencies.Auth import require_permission
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from Entity.Account import Account

def require_donee(user=Depends(require_permission("can_access_donee_dashboard"))):
    return user

router = APIRouter(prefix="/donee", dependencies=[Depends(require_donee)])


# --- FRA ---
@router.get("/fundraising_activities")
def get_fra_list():
    controller = ViewFRAController()
    fras = controller.getFRAList()
    return [fra.to_dict() for fra in fras]

@router.get("/fundraising_activities/{fra_id}")
def get_fra(fra_id: int):
    controller = ViewFRAController()
    fra = controller.getFRA(fra_id)
    if fra is None:
        raise HTTPException(status_code=404, detail="Fundraising activity not found")
    return fra.to_dict()


# --- Donations ---
class DonationInput(BaseModel):
    fra_id: int
    amount: float

@router.get("/donations")
def get_donations(user=Depends(require_permission("can_manage_donation"))):
    controller = DonationController()
    donations = controller.getDonations(user.user_id)
    return [d.to_dict() for d in donations]

@router.post("/donations")
def make_donation(input: DonationInput, user=Depends(require_permission("can_manage_donation"))):
    controller = DonationController()
    try:
        controller.makeDonation(user.user_id, input.fra_id, input.amount)
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