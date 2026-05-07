from fastapi import APIRouter, Request, Response
from Controller.AuthController import AuthController
router = APIRouter()
@router.get("/session")
#frontend call /session -> authController -> Validate Session
def currentSession(req : Request, res : Response): 
        token = req.cookies.get("token")
        if not token:
            return None
        try:
            authC : AuthController = AuthController()
            acc = authC.AuthSession(token)
            return {
                "session_id" : token,
                "user_id" : acc.user_id,
                "role_id" : acc.role_id
            }
        except Exception:
            # Session is Invalid remove from cookie
            res.delete_cookie(key="token")
            return res

        
        
         
    
    
    
    
    