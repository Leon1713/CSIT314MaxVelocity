from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
from Controller.LogoutController import LogoutController

router = APIRouter()

@router.post("/logout")
def logout(req: Request):
    controller = LogoutController()
    token = req.cookies.get("token")
    if token:
        if not controller.logout(token):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=("No session with id = %s was found",(token,)))
    response = JSONResponse(content={"success": True})
    response.delete_cookie(key="token")
    return response
