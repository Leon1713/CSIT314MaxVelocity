from fastapi import Cookie, Depends, HTTPException, status
from Controller.AuthController import AuthController
def get_current_users(session_id : str = Cookie(None, alias="token")):
    try:
        controller = AuthController()
        user = controller.AuthSession(session_id)
        return user
    except Exception:
        return None
    
def require_permission(permissions : str):
    def checker(user = Depends(get_current_users)):
        try:
            controller = AuthController()
            if not controller.hasPermissions(user, permissions):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No permissions")
            return user
        except Exception as e:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return checker
                
            
            
        
    