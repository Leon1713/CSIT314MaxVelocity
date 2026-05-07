from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from Controller.AuthController import AuthController
router = APIRouter()
@router.get("/session")
#frontend call /session -> authController -> Validate Session
def currentSession(req : Request, res : Response): 
        token = req.cookies.get("token")
        if not token:
            return {"success" : False}
        try:
            authC : AuthController = AuthController()
            acc = authC.AuthSession(token)
            return {
                "success" : True,
                "session_id" : token,
                "user_id" : acc.user_id,
                "role_id" : acc.role_id
            }
        except Exception:
            # Session is Invalid remove from cookie
            res = JSONResponse(
                content={"success" : False},
                status_code=401
            )
            res.delete_cookie(key="token")
            return res

        
        
         
    
    
    
    
    