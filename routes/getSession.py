from fastapi import APIRouter, Request
from Controller.AuthController import AuthController
router = APIRouter()
@router.get("/session")
#frontend call /session -> authController -> Validate Session
def currentSession(req : Request): 
        token = req.cookies.get("session_token")
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
            return None
        
        
        
        
        
         
    
    
    
    
    