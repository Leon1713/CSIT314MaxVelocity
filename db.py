import os
from mysql.connector import Error
from mysql.connector.pooling import MySQLConnectionPool
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "fundraising_db"),
    "autocommit": False,
}

try:
    pool = MySQLConnectionPool(
        pool_name="app_pool",
        pool_size=2,
        pool_reset_session=True,
        **DB_CONFIG
    )
except Error as e:
    raise RuntimeError(f"Database pool initialization failed: {e}")


def get_db_connection():
    """
    Borrow a connection from the pool.
    IMPORTANT: caller must close() it to return to pool.
    """
    try:
        return pool.get_connection()
    except Error as e:
        raise RuntimeError(f"Database connection failed: {e}")
def close_pool():
    pool._remove_connections()