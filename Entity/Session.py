from Entity.Account import Account

from .DBHandler import DBHandler
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request
import secrets
class Session(DBHandler):
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
        db_cursor = Session.db_connection.cursor(dictionary=True)
        
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
            Session.db_connection.commit()
            return temp
        except Exception as e:
            Session.db_connection.rollback()
            raise Exception("Failed to create a session")
        finally:
            db_cursor.close()
    
    @staticmethod
    def findSessionByUserId(id : int):
        db_cursor = Session.db_connection.cursor(dictionary=True)
        try:
            db_cursor.execute("SELECT * FROM user_sessions WHERE user_id = %s AND expires_at > NOW() AND is_active = 1", (id,))
            result = db_cursor.fetchone()
            session = Session(result["session_id"], result["user_id"], result["created_at"], result["expires_at"], result["ip_address"],result["is_active"])
            return session
        except Exception as e:
            raise HTTPException(status_code=404, detail="Item not found")
        finally:
            db_cursor.close()
    @staticmethod
    def getSessionBySessionId(id: str) -> "Session":
        db_cursor = Session.db_connection.cursor(dictionary=True)
        try:
            db_cursor.execute("SELECT * FROM user_sessions WHERE session_id = %s AND expires_at > NOW() AND is_active = 1", (id,))
            result = db_cursor.fetchone()    
            session = Session(result["session_id"], result["user_id"], result["created_at"], result["expires_at"], result["ip_address"],result["is_active"])
            return session
        except Exception:
            raise HTTPException(status_code=404, detail="Item not found")
        finally:
            db_cursor.close()
    
    @staticmethod
    def createNewSession(account : Account, req : Request) -> "Session":
        session = Session.create(account.user_id, req.client.host)
        return session
    @staticmethod
    def getCurrentSession(request: Request) -> Session:
        token = request.cookies.get("session_token")
        if not token:
            return None
        try:
            session = Session.getSessionBySessionId(token)
            return session
        except Exception as e:
            return None
    @staticmethod
    def cleanUpExpiredSessions():
        db_cursor = Session.db_connection.cursor(dictionary=True)
        try:
            db_cursor.execute("DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = 0")
            Session.db_connection.commit()
        except Exception as e:
            Session.db_connection.rollback()
            raise Exception("Failed to clean up expired sessions")
        finally:
            db_cursor.close()    

        