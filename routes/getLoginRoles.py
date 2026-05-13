from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from Controller.ViewUserProfileController import ViewUserProfileController

router = APIRouter()


@router.get("/login-roles/{usage}")
def get_login_roles(usage : str):
    controller = ViewUserProfileController()
    try:
        flag = True if usage == "signup" else False
        data = controller.getUserProfileNameID(flag);
        res = JSONResponse(content=data)
        
        return res
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.WS_1011_INTERNAL_ERROR, detail=str(e))