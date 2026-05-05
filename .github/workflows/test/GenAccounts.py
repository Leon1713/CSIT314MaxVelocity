from db import get_db_connection
from argon2 import PasswordHasher

db = get_db_connection()
cursor = db.cursor(dictionary=True)

for i in range(1, 100):
    username = f"TestAdmin{i}"
    

