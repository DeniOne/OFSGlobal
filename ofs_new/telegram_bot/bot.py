import os
import logging
import asyncio
import json
import aiohttp
from aiogram import Bot, Dispatcher, types
from aiogram.contrib.fsm_storage.memory import MemoryStorage # type: ignore
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup # type: ignore
from aiogram.utils import executor
from dotenv import load_dotenv

from handlers import register_handlers
from database import BotDatabase

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    filename="bot.log",
    filemode="a"
)
logger = logging.getLogger(__name__)

# Токен бота из переменных окружения
API_TOKEN = os.getenv("BOT_TOKEN")
if not API_TOKEN:
    raise ValueError("BOT_TOKEN не найден в переменных окружения")

# URL API основной системы
API_URL = os.getenv("API_URL", "http://localhost:8000/api")

# Инициализация бота и диспетчера
bot = Bot(token=API_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

# Инициализация базы данных
db = BotDatabase("bot_data.db")

# Функция для отправки данных в основную систему
async def send_data_to_main_system(employee_data: dict) -> bool:
    """
    Отправляет данные о сотруднике в основную систему через API
    
    Args:
        employee_data: Словарь с данными сотрудника
    
    Returns:
        bool: True если данные успешно отправлены, False в противном случае
    """
    try:
        endpoint = f"{API_URL}/employees/from_bot"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, json=employee_data) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"Данные успешно отправлены в основную систему: {result}")
                    return True
                else:
                    error_text = await response.text()
                    logger.error(f"Ошибка при отправке данных: {response.status} - {error_text}")
                    return False
    except Exception as e:
        logger.error(f"Исключение при отправке данных: {str(e)}")
        return False

# Обновление функции подтверждения данных в handlers.py
async def confirm_employee_data_and_send(user_id: int, state: FSMContext):
    """
    Сохраняет данные сотрудника и отправляет их в основную систему
    
    Args:
        user_id: ID пользователя в Telegram
        state: Текущее состояние FSM
    
    Returns:
        bool: True если данные успешно сохранены и отправлены, False в противном случае
    """
    # Получаем данные из состояния
    data = await state.get_data()
    
    # Сохраняем данные в локальную базу
    db.add_employee(
        name=data.get("name", ""),
        position=data.get("position", ""),
        email=data.get("email", ""),
        phone=data.get("phone", ""),
        telegram_id=data.get("telegram_id", ""),
        photo_id=data.get("photo_id", ""),
        competencies=data.get("competencies", [])
    )
    
    # Отправляем данные в основную систему
    success = await send_data_to_main_system(data)
    
    return success

# Регистрация обработчиков
def register_all_handlers(dp: Dispatcher):
    """Регистрирует все обработчики команд и сообщений"""
    register_handlers(dp, confirm_employee_data_and_send)

async def on_startup(dp: Dispatcher):
    """Действия при запуске бота"""
    # Инициализация базы данных при необходимости
    db.init_db()
    
    # Регистрация обработчиков
    register_all_handlers(dp)
    
    logger.info("Бот запущен")

async def on_shutdown(dp: Dispatcher):
    """Действия при остановке бота"""
    await dp.storage.close()
    await dp.storage.wait_closed()
    
    logger.info("Бот остановлен")

if __name__ == "__main__":
    # Запуск бота
    executor.start_polling(
        dp,
        on_startup=on_startup,
        on_shutdown=on_shutdown,
        skip_updates=True
    ) 