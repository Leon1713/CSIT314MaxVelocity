from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from Controller.AuthController import AuthController
from Entity.Profile import Profile
from db import get_db_connection

router = APIRouter()

@router.get("/session")
def currentSession(req: Request, res: Response):
    token = req.cookies.get("token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session found")
    try:
        authC = AuthController()
        acc = authC.AuthSession(token)

        with get_db_connection() as conn:
            profile = Profile.GetProfileByRoleId(acc.role_id, conn)

        return {
            "success":    True,
            "session_id": token,
            "user_id":    acc.user_id,
            "role_id":    acc.role_id,
            "username":   acc.username,
            "permissions": {
                "can_access_fr_dashboard":           bool(profile.can_access_fr_dashboard),
                "can_access_donee_dashboard":        bool(profile.can_access_donee_dashboard),
                "can_access_admin_dashboard":        bool(profile.can_access_admin_dashboard),
                "can_access_platform_mgt_dashboard": bool(profile.can_access_platform_mgt_dashboard),
            }
        }
    except Exception:
        res = JSONResponse(content={"success": False}, status_code=401)
        res.delete_cookie(key="token")
        return res

        
        
         
    
    
    
    
    