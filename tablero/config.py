import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Configuración de PostgreSQL
    DATABASE_HOST = os.getenv('DB_HOST', 'localhost')
    DATABASE_PORT = os.getenv('DB_PORT', '5432')
    DATABASE_NAME = os.getenv('DB_NAME', 'quiz_game_db')
    DATABASE_USER = os.getenv('DB_USER', 'postgres')
    DATABASE_PASSWORD = os.getenv('DB_PASSWORD', '')
    
    # URL de conexión completa
    DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
    
    # Configuración de Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # Configuración de SocketIO
    SOCKETIO_ASYNC_MODE = 'threading'