from __future__ import annotations
from db import get_db_connection


class Account:
    # Define the attributes of the Account class
    def __init__(self, user_id: int, username: str, email: str, password_hash: str, role_id: int, first_name: str, last_name: str, phone: str, is_active: bool, is_suspended: bool, created_at, updated_at, last_login):
        super().__init__()
        self.user_id = user_id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role_id = role_id
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.is_active = is_active
        self.is_suspended = is_suspended
        self.created_at = created_at
        self.updated_at = updated_at
        self.last_login = last_login

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "password_hash": self.password_hash,
            "email": self.email,
            "role_id": self.role_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "is_active": self.is_active,
            "is_suspended": self.is_suspended,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "last_login": self.last_login
        }

    @staticmethod
    def findUsersByEmailOrUsername(email_or_username: str, role_input: int):
        try:
            db_conn = get_db_connection()
            db_cursor = db_conn.cursor(dictionary=True)
            # Check if the role exists, will raise an error if it doesn't
            # roleId = Account.getRoleId(role_input)
            db_cursor.execute("""
                              (SELECT * FROM user_accounts
                              WHERE username = %s AND role_id = %s AND is_suspended = 0)
                              UNION ALL
                              (SELECT * FROM user_accounts
                              WHERE email = %s AND role_id = %s AND is_suspended = 0)
                              """,
                              (email_or_username, role_input, email_or_username, role_input))
            user_data = db_cursor.fetchall()
            if user_data:
                # For each user in the result, create an Account object and return a list of them
                return [Account(**user) for user in user_data]
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def getRoleId(role_name: str) -> int:
        try:
            db_conn = get_db_connection()
            db_cursor = db_conn.cursor(dictionary=True)
            db_cursor.execute(
                "SELECT role_id FROM user_roles WHERE role_name = %s", (role_name,))
            result = db_cursor.fetchone()
            if result:
                return result["role_id"]
            else:
                raise ValueError(
                    f"Role '{role_name}' not found in the database.")
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def insertNewUser(account_data: dict) -> bool:
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""
                INSERT INTO user_accounts (username, email, password_hash, role_id, first_name, last_name, phone, is_active, is_suspended)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                account_data["username"],
                account_data["email"],
                account_data["password_hash"],
                account_data["role_id"],
                account_data["first_name"],
                account_data["last_name"],
                account_data["phone"],
                # Default to True if not provided
                account_data.get("is_active", True),
                # Default to False if not provided
                account_data.get("is_suspended", False)
            ))

            # Commit the transaction to save the new user in the database
            db_conn.commit()
            return True
        except Exception as e:
            print(f"Error inserting new user: {e}")
            return False  # Return False to indicate failure
        finally:
            db_cursor.close()  # Close the cursor to free up resources
            db_conn.close()

    def auth(self, password: str, hasher):
        if hasher.verify(password, self.password_hash):
            return self
        else:
            return None  # Return None to indicate authentication failure

    @staticmethod
    def authenticate(email: str, password: str, role: str, hasher):
        users = Account.findUsersByEmailOrUsername(email, role)

        if users and (authenticated_user := users[0].auth(password, hasher)):
            authenticated_user.SetLastLogin()
            return authenticated_user

        raise Exception("Invalid email or password")

    @staticmethod
    def getUsersById(id: str):
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute(
                """SELECT u.* FROM user_accounts u where u.user_id = %s""", (id,))
            account_dict = db_cursor.fetchone()
            result = Account(**account_dict)
            return result
        except Exception:
            raise Exception("User account with id = %s is not found", (id,))
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def getAllUsers():
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""SELECT * FROM user_accounts""")
            accounts = db_cursor.fetchall()
            list_account: list[Account] = [Account(**acc) for acc in accounts]
            return list_account
        except Exception:
            return None
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def update(user_id, update_dict) -> bool:

        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            set_clauses = [f"{key} = %s" for key in update_dict.keys()]
            query = f"UPDATE user_accounts SET {', '.join(set_clauses)} WHERE user_id = %s"
            query_values = list(update_dict.values()) + [user_id]
            db_cursor.execute(query, query_values)
            db_conn.commit()
            return True
        except Exception as e:
            print(f"Error updating user: {e}")
            db_conn.rollback()
            raise Exception(
                "Error updating Account with id = %s", (user_id,))
        finally:
            db_cursor.close()
            db_conn.close()

    @staticmethod
    def suspend(user_id: int):
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute("""UPDATE user_accounts
                              SET is_suspended = 1, is_active = 0
                              WHERE user_id = %s""", (user_id,))
            db_conn.commit()
        except Exception:
            db_conn.rollback()
            raise Exception(
                "Error Suspending Account with id = %s", (user_id,))
        finally:
            db_cursor.close()
            db_conn.close()

    def SetLastLogin(self: "Account"):
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute(
                """UPDATE user_accounts SET last_login = NOW(), updated_at = updated_at WHERE user_id = %s""", (self.user_id,))
            db_conn.commit()
        except Exception:
            raise
        finally:
            db_cursor.close()
            db_conn.close()
            print("test")

    @staticmethod
    def getRecentUpdatesAndLogin(limit: id):
        conn = get_db_connection()
        db_conn = conn
        db_cursor = db_conn.cursor(dictionary=True)
        try:
            db_cursor.execute(
                """SELECT
                u.user_id,
    u.username,
    u.last_login AS event_time,
    'last_login' AS event_type,
    r.role_name,
    u.is_active
FROM user_accounts u
JOIN user_roles r
    ON u.role_id = r.role_id
WHERE u.last_login IS NOT NULL
UNION ALL
SELECT
u.user_id,
    u.username,
    u.updated_at AS event_time,
    'updated_at' AS event_type,
    r.role_name,
    u.is_active
FROM user_accounts u
JOIN user_roles r
    ON u.role_id = r.role_id

ORDER BY event_time DESC
LIMIT %s;""", (limit,)
            )
            return db_cursor.fetchall()
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def getAdminDashboardStats(user=None):
        try:
            conn = get_db_connection()
            db_cursor = conn.cursor(dictionary=True)
            db_cursor.execute("""
                              SELECT COUNT(u.user_id) AS total_accounts,
                              SUM(CASE WHEN u.is_suspended = 1 THEN 1 ELSE 0 END) as suspended_accounts,
                              SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END) as active_accounts,
                              (SELECT COUNT(role_id) FROM user_roles) as total_roles
                              FROM user_accounts u;
                              """)
            return db_cursor.fetchone()
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def getAllUsersWithRoles():
        try:
            conn = get_db_connection()
            db_cursor = conn.cursor(dictionary=True)
            db_cursor.execute(
                """SELECT u.*, r.role_name FROM user_accounts u JOIN user_roles r ON u.role_id = r.role_id ORDER BY u.last_login DESC"""
            )
            return db_cursor.fetchall()
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def search(input: str, active: str):  # list method
        try:
            conn = get_db_connection()
            db_cursor = conn.cursor(dictionary=True)
            active_in = ""
            if active != "":
                active_in = active
            db_cursor.execute("""
                              SELECT u.*, r.role_name
FROM user_accounts u
JOIN user_roles r ON u.role_id = r.role_id
WHERE (%s = '' OR u.is_active = %s)
  AND (%s = '' OR username LIKE CONCAT('%', %s, '%') OR email LIKE CONCAT('%', %s, '%'));
                              """, (active, active,  input, input, input,))
            return db_cursor.fetchall()
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            conn.close()

    @staticmethod
    def GetUsersById(id):  # true get method
        try:
            conn = get_db_connection()
            db_cursor = conn.cursor(dictionary=True)

            db_cursor.execute("""
        SELECT u.*,r.role_name FROM user_accounts u join user_roles r
        ON u.role_id = r.role_id
        WHERE u.user_id = %s;
        """, (id,))
            return db_cursor.fetchone()
        except Exception as e:
            print(e)
            raise
        finally:
            db_cursor.close()
            conn.close()
    @staticmethod
    def 