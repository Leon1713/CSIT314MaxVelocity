from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from Entity.Session import Session

router = APIRouter()

@router.post("/logout")
def logout(req: Request):
    token = req.cookies.get("token")
    if token:
        try:
            Session.deactivate(token)
        except Exception:
            pass
    response = JSONResponse(content={"success": True})
    response.delete_cookie(key="token")
    return response
