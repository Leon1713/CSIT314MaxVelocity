class LoginResponse:
    def __init__(self, session_id, user_id, role_id):
        self.session_id = session_id
        self.user_id = user_id
        self.role_id = role_id