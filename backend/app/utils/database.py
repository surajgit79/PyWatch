import pymysql
from app.config import Config

def get_db_connection():
    try:
        connection = pymysql.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=50
        )
        
        if connection.open:
            return connection
            
    except Exception as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def close_db_connection(connection, cursor=None):
    try:
        if cursor:
            cursor.close()
        if connection and connection.open:
            connection.close()
    except Exception as e:
        print(f"Error closing connection: {e}")