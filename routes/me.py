from fastapi import APIRouter, Request
from db import get_db_connection
router = APIRouter()
@router.get("/me")
def Me(req : Request): # return error message if invalid, # return user id, session id, name, role_id
    db_conn = get_db_connection()
    db_cursor = db_conn.cursor(dictionary=True)
    session_id_check = req.cookies.get("session_token")
    try:
        db_cursor.execute("""
                          SELECT user_sessions.session_id, user_accounts.user_id, user_accounts.username, user_roles.role_name 
                          FROM user_accounts 
                          JOIN user_sessions ON user_sessions.user_id = user_accounts.user_id 
                          JOIN user_roles ON user_accounts.role_id = user_roles.role_id
                          WHERE user_sessions.expires_at > now() AND user_sessions.session_id = %s
                          """, (session_id_check,))
        user = db_cursor.fetchone()
        res = {
            "success" : True,
            "session_id": user["session_id"],
            "user_id" : user["user_id"],
            "username": user["username"],
            "role_name": user["role_name"],
            "message" : "Session found"
        }
        return res
    except Exception as e:
        res = {
            "success" : False,
            "error": "Invalid session"
        }
        return res
    
    