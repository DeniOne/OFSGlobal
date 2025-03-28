import os
import logging
from typing import List
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Config:
    """Класс для доступа к конфигурационным параметрам"""
    
    def __init__(self):
        """Инициализация конфигурации"""
        # Токен бота
        self.BOT_TOKEN = os.getenv("BOT_TOKEN")
        if not self.BOT_TOKEN:
            logger.error("Не задан токен бота (BOT_TOKEN) в .env файле!")
            raise ValueError("Отсутствует обязательный параметр BOT_TOKEN")
        
        # ID администраторов
        admin_ids = os.getenv("ADMIN_IDS", "")
        self.ADMIN_IDS = [int(admin_id.strip()) for admin_id in admin_ids.split(",") if admin_id.strip()]
        
        # Путь к хранилищу данных
        self.STORAGE_PATH = os.getenv("STORAGE_PATH", "./data")
        
        # Настройки логирования
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FILE = os.path.join(self.STORAGE_PATH, "logs", "bot.log")
        
        # Убедимся, что директория для логов существует
        self._ensure_log_directory()
        
        logger.info("Конфигурация загружена успешно")
    
    def _ensure_log_directory(self):
        """Создает директорию для логов, если она не существует"""
        log_dir = os.path.dirname(self.LOG_FILE)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            logger.info(f"Создана директория для логов: {log_dir}")
    
    def is_admin(self, user_id: int) -> bool:
        """Проверяет, является ли пользователь администратором"""
        return user_id in self.ADMIN_IDS

    # Настройки безопасности
    MAX_REQUESTS_PER_MINUTE: int = 30
    MAX_REGISTRATION_ATTEMPTS: int = 3

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8" 