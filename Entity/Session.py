from Entity.Account import Account

from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request
from db import get_db_connection
import secrets
class Session:
    def __init__(self, session_id, user_id, created_at = None,expires_at = None, ip_address = None, is_active = True ):
        super().__init__()
        self.session_id = session_id
        self.user_id = user_id
        self.created_at = created_at
        self.expires_at = expires_at
        self.ip_address = ip_address
        self.is_active = is_active
    @staticmethod
    def create(user_id_, ip_address, secondsToExpire = 5*60) -> "Session":
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        
        session_id = secrets.token_hex(32)
        expires = datetime.now(timezone.utc) + timedelta(seconds=secondsToExpire)
        now = datetime.now(timezone.utc)
        print(expires)
        temp = Session(session_id, user_id_,now,expires,ip_address)
        try:
            db_cursor.execute("""INSERT INTO user_sessions(session_id, user_id, created_at, expires_at, ip_address,is_active) 
                            VALUES(%s,%s,%s,%s,%s,%s)""",(
                                  temp.session_id,
                                temp.user_id,
                                temp.created_at,
                                temp.expires_at,
                                temp.ip_address,
                                temp.is_active
                            ))
            db_conn.commit()
            return temp
        except Exception as e:
            db_conn.rollback()
            raise Exception("Failed to create a session")
        finally:
            db_conn.close()
            db_cursor.close()
    
    @staticmethod
    def findSessionByUserId(id : int):
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("SELECT * FROM user_sessions WHERE user_id = %s AND expires_at > NOW() AND is_active = 1", (id,))
            result = db_cursor.fetchone()
            session = Session(result["session_id"], result["user_id"], result["created_at"], result["expires_at"], result["ip_address"],result["is_active"])
            return session
        except Exception as e:
            raise HTTPException(status_code=404, detail="Item not found")
        finally:
            db_cursor.close()
            db_conn.close()
    @staticmethod
    def getSessionBySessionId(id: str) -> "Session":
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("SELECT * FROM user_sessions WHERE session_id = %s AND expires_at > NOW() AND is_active = 1", (id,))
            result = db_cursor.fetchone()    
            session = Session(result["session_id"], result["user_id"], result["created_at"], result["expires_at"], result["ip_address"],result["is_active"])
            return session
        except Exception:
            raise HTTPException(status_code=404, detail="Item not found")
        finally:
            db_cursor.close()
            db_conn.close()
    
    @staticmethod
    def createNewSession(account : Account, req : Request) -> "Session":
        session = Session.create(account.user_id, req.client.host)
        return session
    @staticmethod
    def getCurrentSession(request: Request) -> "Session":
        token = request.cookies.get("session_token")
        if not token:
            return None
        try:
            session = Session.getSessionBySessionId(token)
            return session
        except Exception as e:
            return None
    @staticmethod
    def deactivate(session_id: str) -> bool:
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("UPDATE user_sessions SET is_active = 0 WHERE session_id = %s", (session_id,))
            db_conn.commit()
            return True
        except Exception:
            db_conn.rollback()
            raise Exception("Failed to deactivate session")
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def cleanUpExpiredSessions():
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = 0")
            db_conn.commit()
        except Exception as e:
            db_conn.rollback()
            raise Exception("Failed to clean up expired sessions")
        finally:
            db_cursor.close()
            db_conn.close()    

        