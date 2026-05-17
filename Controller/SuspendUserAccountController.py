from Entity.Account import Account
from Entity.Session import Session
class SuspendUserAccountController:
    def __init__(self):
        pass
    def suspend(self, user_id : int) -> bool:
            try:
                Account.suspend(user_id)
                sess = Session.findSessionByUserId(user_id)
                if(sess):
                    Session.deactivate(sess.session_id)
                return True
            except Exception:
                raise