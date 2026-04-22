import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

loaded = load_dotenv()  # reads from .env file automatically


DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),  # Default to 3306 if not provided
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "fundraising_db"),
    "autocommit": False,
}

_connection = None

def get_db_connection():
    global _connection
    try:
        if _connection is None or not _connection.is_connected():
            _connection = mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        raise RuntimeError(f"Database connection failed: {e}")
    return _connection
