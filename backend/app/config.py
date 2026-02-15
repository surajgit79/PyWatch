import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'paywatch_db')
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = 24
    
    EXCHANGE_RATE_API_KEY = os.getenv('EXCHANGE_RATE_API_KEY')
    EXCHANGE_RATE_API_URL = os.getenv('EXCHANGE_RATE_API_URL')
    
    APP_NAME = os.getenv('APP_NAME', 'PayWatch')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')