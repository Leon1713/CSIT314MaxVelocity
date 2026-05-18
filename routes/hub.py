from fastapi import APIRouter, Depends, HTTPException, status
from Controller.GetFRACategoriesController import GetFRACategoriesController
from Controller.ViewUserProfileController import ViewUserProfileController
from Dependencies.Auth import get_current_users
from Entity.Account import Account

router = APIRouter()


@router.get("/hub")
def getHubData(user: Account = Depends(get_current_users)):
    controller: ViewUserProfileController = ViewUserProfileController()
    try:
        user_dict = {"username": user.username, "success": True}
        dictor = controller.getUserProfile(user.role_id).to_dict()
        dictor |= user_dict
        return dictor
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.WS_1011_INTERNAL_ERROR, detail=str(e))

@router.get("/categories")
def get_categories():
    controller = GetFRACategoriesController()
    try:
        return controller.getCategories()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
