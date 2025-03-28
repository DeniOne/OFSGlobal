import re
import logging
from aiogram import Router, F, Bot
from aiogram.filters import Command, StateFilter
from aiogram.types import Message, CallbackQuery, ReplyKeyboardMarkup, KeyboardButton
from aiogram.fsm.context import FSMContext
from typing import Dict, Any, List
import asyncio

from database import BotDatabase
from states import AdminStates
import keyboards
from api_client import ApiClient
from config import Config

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Инициализация роутера
router = Router()

# Инициализация зависимостей
db = BotDatabase()
api_client = ApiClient()
config = Config()

# Фильтр для проверки прав админа
def is_admin_filter(message: Message) -> bool:
    """Фильтр для проверки, является ли пользователь админом"""
    return db.is_admin(str(message.from_user.id))

def is_superadmin_filter(message: Message) -> bool:
    """Фильтр для проверки, является ли пользователь супер-админом"""
    return db.is_superadmin(str(message.from_user.id))

# Команда для входа в админ-панель
@router.message(Command("admin"))
async def admin_panel(message: Message):
    """Показывает панель администратора"""
    user_id = message.from_user.id
    username = message.from_user.username
    
    # Проверяем сначала по ID, затем по username
    is_admin = user_id in config.ADMIN_IDS or f"@{username}" in config.ADMIN_IDS
    
    if not is_admin:
        logger.warning(f"Пользователь {user_id} (@{username}) попытался получить доступ к панели администратора")
        await message.answer("⛔ У вас нет прав администратора.")
        return
    
    # Отображаем панель администратора
    admin_keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📋 Заявки на регистрацию")],
            [KeyboardButton(text="👤 Управление пользователями")],
            [KeyboardButton(text="📊 Статистика")],
            [KeyboardButton(text="🔙 Вернуться в главное меню")]
        ],
        resize_keyboard=True
    )
    
    await message.answer(
        "👨‍💼 <b>Панель администратора</b>\n\n"
        "Выберите действие:",
        reply_markup=admin_keyboard,
        parse_mode="HTML"
    )

# Обработчик кнопки "Заявки"
@router.message(F.text == "📋 Заявки", is_admin_filter)
async def show_requests(message: Message):
    """Отображает список заявок на регистрацию"""
    requests = db.get_pending_registration_requests()
    
    if not requests:
        await message.answer(
            "📭 На данный момент нет заявок на регистрацию.",
            reply_markup=keyboards.get_admin_keyboard()
        )
        return
    
    await message.answer(
        f"📋 <b>Заявки на регистрацию ({len(requests)})</b>\n\n"
        f"Выбери заявку для обработки:",
        reply_markup=keyboards.get_pending_requests_keyboard(requests)
    )

# Добавляем новый обработчик для кнопки "Заявки на регистрацию"
@router.message(F.text == "📋 Заявки на регистрацию")
async def show_registration_requests(message: Message):
    """Отображает список заявок на регистрацию (альтернативная кнопка)"""
    # Перенаправляем на существующий обработчик
    await show_requests(message)

# Обработчик запроса обновления списка заявок
@router.callback_query(F.data == "refresh_requests")
async def refresh_requests(callback: CallbackQuery):
    """Обновляет список заявок"""
    requests = db.get_pending_registration_requests()
    
    if not requests:
        await callback.message.edit_text(
            "📭 На данный момент нет заявок на регистрацию."
        )
        return
    
    await callback.message.edit_text(
        f"📋 <b>Заявки на регистрацию ({len(requests)})</b>\n\n"
        f"Выбери заявку для обработки:",
        reply_markup=keyboards.get_pending_requests_keyboard(requests)
    )
    
    await callback.answer("Список обновлен")

# Обработчик кнопки "Назад к админке"
@router.callback_query(F.data == "back_to_admin")
async def back_to_admin(callback: CallbackQuery):
    """Возврат в главное меню админки"""
    await callback.message.edit_text(
        "👑 <b>Админ-панель</b>\n\n"
        "Используй кнопки на клавиатуре для навигации."
    )
    await callback.message.answer(
        "Выбери действие:",
        reply_markup=keyboards.get_admin_keyboard()
    )
    
    await callback.answer()

# Обработчик выбора заявки из списка
@router.callback_query(F.data.startswith("request_"))
async def select_request(callback: CallbackQuery):
    """Отображает данные конкретной заявки"""
    request_id = int(callback.data.split("_")[1])
    request = db.get_registration_request(request_id)
    
    if not request:
        await callback.message.edit_text(
            "❌ Заявка не найдена или уже обработана.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Заявка не найдена")
        return
    
    # Формируем текст с данными заявки
    username = request.get('telegram_username', 'Нет данных')
    username_text = f"@{username}" if username and not username.startswith('@') else username
    
    text = (
        f"📝 <b>Заявка #{request['id']}</b>\n\n"
        f"<b>Telegram ID:</b> {request['telegram_id']}\n"
        f"<b>Username:</b> {username_text}\n"
        f"<b>Имя пользователя:</b> {request.get('user_full_name', 'Нет данных')}\n"
        f"<b>Примерная должность:</b> {request.get('approximate_position', 'Не указана')}\n"
        f"<b>Дата создания:</b> {request['created_at']}\n\n"
        f"Выберите действие:"
    )
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboards.get_request_action_keyboard(request_id)
    )
    
    await callback.answer()

# Обработчик кнопки "Назад к списку заявок"
@router.callback_query(F.data == "back_to_requests")
async def back_to_requests(callback: CallbackQuery):
    """Возврат к списку заявок"""
    requests = db.get_pending_registration_requests()
    
    if not requests:
        await callback.message.edit_text(
            "📭 На данный момент нет заявок на регистрацию."
        )
        return
    
    await callback.message.edit_text(
        f"📋 <b>Заявки на регистрацию ({len(requests)})</b>\n\n"
        f"Выбери заявку для обработки:",
        reply_markup=keyboards.get_pending_requests_keyboard(requests)
    )
    
    await callback.answer()

# Обработчик кнопки "Отклонить заявку"
@router.callback_query(F.data.startswith("reject_request_"))
async def reject_request(callback: CallbackQuery):
    """Отклоняет заявку на регистрацию"""
    request_id = int(callback.data.split("_")[2])
    
    # Обновляем статус заявки
    success = db.process_registration_request(
        request_id=request_id,
        status="rejected",
        admin_id=str(callback.from_user.id)
    )
    
    if not success:
        await callback.message.edit_text(
            "❌ Не удалось отклонить заявку. Попробуйте позже.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Ошибка")
        return
    
    # Получаем данные заявки
    request = db.get_registration_request(request_id)
    
    await callback.message.edit_text(
        f"✅ Заявка #{request_id} успешно отклонена.",
        reply_markup=keyboards.get_back_to_main_keyboard()
    )
    
    # Отправляем уведомление пользователю
    bot = callback.bot
    await bot.send_message(
        chat_id=request['telegram_id'],
        text="❌ <b>Заявка отклонена</b>\n\n"
             "Ваша заявка на регистрацию была отклонена администратором.\n"
             "Возможно, вы указали неверные данные или не являетесь сотрудником организации.\n\n"
             "Если вы считаете, что произошла ошибка, свяжитесь с администрацией."
    )
    
    await callback.answer("Заявка отклонена")

# Обработчик кнопки "Одобрить заявку"
@router.callback_query(F.data.startswith("approve_request_"))
async def approve_request(callback: CallbackQuery, state: FSMContext):
    """Начинает процесс одобрения заявки"""
    request_id = int(callback.data.split("_")[2])
    
    # Получаем данные заявки
    request = db.get_registration_request(request_id)
    
    if not request:
        await callback.message.edit_text(
            "❌ Заявка не найдена или уже обработана.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Заявка не найдена")
        return
    
    # Сохраняем ID заявки в состоянии
    await state.update_data(request_id=request_id)
    
    # Получаем список должностей из API
    try:
        # Запрашиваем должности через API
        positions = await api_client.get_positions()
        
        if not positions:
            # Если API не вернул должности, используем заглушки
            logger.warning("API не вернул должности, используем заглушки")
            positions = [
                {"id": 1, "name": "Генеральный директор", "description": "Высшее руководящее лицо компании"},
                {"id": 2, "name": "Технический директор", "description": "Руководитель технического направления"},
                {"id": 3, "name": "Руководитель отдела", "description": "Управление отделом компании"},
                {"id": 4, "name": "Менеджер проекта", "description": "Управление проектами компании"},
                {"id": 5, "name": "Разработчик", "description": "Разработка программного обеспечения"}
            ]
        
        # Сохраняем список позиций в состоянии
        await state.update_data(positions=positions)
        
        # Устанавливаем состояние ожидания выбора должности
        await state.set_state(AdminStates.waiting_for_position_selection)
        
        # Меняем сообщение на выбор должности
        await callback.message.edit_text(
            f"👨‍💼 <b>Выбор должности для заявки #{request_id}</b>\n\n"
            f"<b>Пользователь:</b> {request.get('user_full_name', 'Нет данных')}\n"
            f"<b>Примерная должность:</b> {request.get('approximate_position', 'Не указана')}\n\n"
            f"Выберите должность из списка или вернитесь к заявке:",
            reply_markup=keyboards.get_positions_keyboard(positions, request_id)
        )
        
        # Также запрашиваем список отделов, чтобы потом можно было выбрать
        divisions = await api_client.get_divisions()
        if divisions:
            await state.update_data(divisions=divisions)
        
        await callback.answer()
    except Exception as e:
        logger.error(f"Ошибка при получении должностей: {e}")
        await callback.message.edit_text(
            "❌ Произошла ошибка при получении списка должностей. Попробуйте позже.",
            reply_markup=keyboards.get_back_to_request_keyboard(request_id)
        )
        await callback.answer("Ошибка")

# Обработчик выбора должности
@router.callback_query(StateFilter(AdminStates.waiting_for_position_selection), F.data.startswith("position_"))
async def select_position(callback: CallbackQuery, state: FSMContext):
    """Обрабатывает выбор должности и генерирует код приглашения"""
    position_id = int(callback.data.split("_")[1])
    
    # Получаем данные из состояния
    data = await state.get_data()
    request_id = data.get("request_id")
    positions = data.get("positions", [])
    divisions = data.get("divisions", [])
    
    # Получаем данные заявки
    request = db.get_registration_request(request_id)
    
    if not request:
        await callback.message.edit_text(
            "❌ Заявка не найдена или уже обработана.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Заявка не найдена")
        await state.clear()
        return
    
    # Находим выбранную должность в списке
    selected_position = None
    for position in positions:
        if position.get('id') == position_id or str(position.get('id')) == str(position_id):
            selected_position = position
            break
    
    if not selected_position:
        await callback.message.edit_text(
            "❌ Выбранная должность не найдена. Попробуйте еще раз.",
            reply_markup=keyboards.get_back_to_request_keyboard(request_id)
        )
        await callback.answer("Должность не найдена")
        await state.clear()
        return
    
    # Сохраняем выбранную должность в состоянии
    await state.update_data(
        selected_position_id=position_id,
        selected_position_name=selected_position.get('name', selected_position.get('title', 'Неизвестная должность')),
        selected_position=selected_position
    )
    
    # Если есть отделы, предлагаем выбрать отдел
    if divisions:
        await state.set_state(AdminStates.waiting_for_division_selection)
        
        # Формируем клавиатуру с отделами
        await callback.message.edit_text(
            f"🏢 <b>Выбор отдела для заявки #{request_id}</b>\n\n"
            f"<b>Пользователь:</b> {request.get('user_full_name', 'Нет данных')}\n"
            f"<b>Выбранная должность:</b> {selected_position.get('name', selected_position.get('title', 'Неизвестная должность'))}\n\n"
            f"Выберите отдел из списка или пропустите этот шаг:",
            reply_markup=keyboards.get_api_divisions_keyboard(divisions, request_id)
        )
        
        await callback.answer()
        return
    
    # Если отделов нет, генерируем код приглашения
    await generate_invitation_code(callback, state)

# Обработчик выбора отдела
@router.callback_query(StateFilter(AdminStates.waiting_for_division_selection), F.data.startswith("division_"))
async def select_division(callback: CallbackQuery, state: FSMContext):
    """Обрабатывает выбор отдела и генерирует код приглашения"""
    division_id = int(callback.data.split("_")[1])
    
    # Получаем данные из состояния
    data = await state.get_data()
    divisions = data.get("divisions", [])
    
    # Находим выбранный отдел в списке
    selected_division = None
    for division in divisions:
        if division.get('id') == division_id or str(division.get('id')) == str(division_id):
            selected_division = division
            break
    
    if not selected_division:
        await callback.answer("Отдел не найден")
        return
    
    # Сохраняем выбранный отдел в состоянии
    await state.update_data(
        selected_division_id=division_id,
        selected_division_name=selected_division.get('name', 'Неизвестный отдел'),
        selected_division=selected_division
    )
    
    # Генерируем код приглашения
    await generate_invitation_code(callback, state)

# Обработчик пропуска выбора отдела
@router.callback_query(StateFilter(AdminStates.waiting_for_division_selection), F.data == "skip_division")
async def skip_division(callback: CallbackQuery, state: FSMContext):
    """Пропускает выбор отдела и генерирует код приглашения"""
    # Генерируем код приглашения
    await generate_invitation_code(callback, state)

# Обработчик возврата к выбору должности
@router.callback_query(F.data == "back_to_position_selection")
async def back_to_position_selection(callback: CallbackQuery, state: FSMContext):
    """Возвращает к выбору должности"""
    # Получаем данные из состояния
    data = await state.get_data()
    request_id = data.get("request_id")
    positions = data.get("positions", [])
    request = db.get_registration_request(request_id)
    
    # Устанавливаем состояние выбора должности
    await state.set_state(AdminStates.waiting_for_position_selection)
    
    # Отображаем список должностей
    await callback.message.edit_text(
        f"👨‍💼 <b>Выбор должности для заявки #{request_id}</b>\n\n"
        f"<b>Пользователь:</b> {request.get('user_full_name', 'Нет данных')}\n"
        f"<b>Примерная должность:</b> {request.get('approximate_position', 'Не указана')}\n\n"
        f"Выберите должность из списка или вернитесь к заявке:",
        reply_markup=keyboards.get_positions_keyboard(positions, request_id)
    )
    
    await callback.answer()

# Функция для генерации кода приглашения
async def generate_invitation_code(callback: CallbackQuery, state: FSMContext):
    """Генерирует код приглашения на основе выбранной должности и отдела"""
    # Получаем данные из состояния
    data = await state.get_data()
    request_id = data.get("request_id")
    request = db.get_registration_request(request_id)
    
    # Получаем данные о выбранной должности
    selected_position = data.get("selected_position")
    position_id = selected_position.get('id')
    position_name = selected_position.get('name', selected_position.get('title', 'Неизвестная должность'))
    
    # Получаем данные о выбранном отделе (если есть)
    selected_division = data.get("selected_division")
    division_id = None
    division_name = "Не указан"
    
    if selected_division:
        division_id = selected_division.get('id')
        division_name = selected_division.get('name', 'Неизвестный отдел')
    
    # Данные для API
    invite_code_data = {
        "position_id": position_id,
        "division_id": division_id,
        "telegram_id": request.get('telegram_id'),
        "user_full_name": request.get('user_full_name', 'Нет данных'),
        "organization_id": 1  # По умолчанию используем первую организацию
    }
    
    # Генерируем код через API
    api_result = await api_client.generate_invitation_code(invite_code_data)
    
    if api_result.get("success"):
        # Код успешно сгенерирован через API
        invitation_code = api_result.get("code")
        expires_at = api_result.get("expires_at", "неизвестно")
        
        # Сохраняем код в БД
        db.save_invitation_code(
            request_id=request_id,
            code=invitation_code,
            position_id=position_id,
            position_name=position_name,
            division_id=division_id,
            division_name=division_name,
            expires_at=expires_at
        )
        
        # Отправляем код пользователю
        await send_invitation_to_user(
            request_id, 
            invitation_code, 
            position_name, 
            division_name if division_id else None
        )
        
        # Отображаем сообщение админу о успешной генерации кода
        await callback.message.edit_text(
            f"✅ <b>Код приглашения сгенерирован для заявки #{request_id}</b>\n\n"
            f"<b>Код:</b> <code>{invitation_code}</code>\n"
            f"<b>Действителен до:</b> {expires_at}\n"
            f"<b>Пользователь:</b> {request.get('user_full_name', 'Нет данных')}\n"
            f"<b>Должность:</b> {position_name}\n"
            f"<b>Отдел:</b> {division_name}\n\n"
            f"Код был отправлен пользователю.",
            reply_markup=keyboards.get_back_to_request_keyboard(request_id)
        )
    else:
        # Ошибка при генерации кода через API
        error_message = api_result.get("message", "Неизвестная ошибка")
        
        await callback.message.edit_text(
            f"❌ <b>Ошибка при генерации кода приглашения</b>\n\n"
            f"<b>Заявка:</b> #{request_id}\n"
            f"<b>Пользователь:</b> {request.get('user_full_name', 'Нет данных')}\n"
            f"<b>Должность:</b> {position_name}\n"
            f"<b>Отдел:</b> {division_name}\n\n"
            f"<b>Ошибка:</b> {error_message}",
            reply_markup=keyboards.get_back_to_request_keyboard(request_id)
        )
    
    # Обновляем состояние заявки
    db.update_registration_request(request_id, status="approved")
    
    # Очищаем состояние
    await state.clear()
    
    await callback.answer()

# Обработчик кнопки "Назад" при выборе должности
@router.callback_query(F.data.startswith("back_to_request_"))
async def back_to_request(callback: CallbackQuery, state: FSMContext):
    """Возврат к просмотру заявки"""
    request_id = int(callback.data.split("_")[3])
    request = db.get_registration_request(request_id)
    
    await state.clear()
    
    if not request:
        await callback.message.edit_text(
            "❌ Заявка не найдена или уже обработана.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Заявка не найдена")
        return
    
    # Формируем текст с данными заявки
    username = request.get('telegram_username', 'Нет данных')
    username_text = f"@{username}" if username and not username.startswith('@') else username
    
    text = (
        f"📝 <b>Заявка #{request['id']}</b>\n\n"
        f"<b>Telegram ID:</b> {request['telegram_id']}\n"
        f"<b>Username:</b> {username_text}\n"
        f"<b>Имя пользователя:</b> {request.get('user_full_name', 'Нет данных')}\n"
        f"<b>Примерная должность:</b> {request.get('approximate_position', 'Не указана')}\n"
        f"<b>Дата создания:</b> {request['created_at']}\n\n"
        f"Выберите действие:"
    )
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboards.get_request_action_keyboard(request_id)
    )
    
    await callback.answer()

# Обработчик кнопки "Статистика"
@router.message(F.text == "📊 Статистика", is_admin_filter)
async def show_stats(message: Message):
    """Показывает статистику бота и админа"""
    admin_id = str(message.from_user.id)
    
    # Получаем статистику админа
    admin_stats = db.get_admin_stats(admin_id)
    
    # Получаем общую статистику
    employees = db.get_all_employees()
    requests = db.get_pending_registration_requests()
    
    # Формируем текст со статистикой
    text = (
        f"📊 <b>Статистика</b>\n\n"
        f"<b>Общая статистика:</b>\n"
        f"• Всего сотрудников: {len(employees)}\n"
        f"• Ожидающих заявок: {len(requests)}\n\n"
        f"<b>Ваша статистика:</b>\n"
        f"• Обработано заявок: {admin_stats['processed_requests']}\n"
        f"• Одобрено заявок: {admin_stats['approved_requests']}\n"
        f"• Отклонено заявок: {admin_stats['rejected_requests']}\n"
        f"• Сгенерировано кодов: {admin_stats['generated_codes']}\n"
        f"• Использовано кодов: {admin_stats['used_codes']}"
    )
    
    await message.answer(
        text,
        reply_markup=keyboards.get_admin_keyboard()
    )

# Обработчик кнопки "Управление админами"
@router.message(F.text == "👥 Управление админами", is_admin_filter)
async def admin_management(message: Message):
    """Отображает меню управления администраторами"""
    await message.answer(
        "👥 <b>Управление администраторами</b>\n\n"
        "Выберите действие:",
        reply_markup=keyboards.get_admin_management_keyboard(),
        parse_mode="HTML"
    )

# Добавляем новый обработчик для кнопки "Управление пользователями"
@router.message(F.text == "👤 Управление пользователями")
async def user_management(message: Message):
    """Отображает меню управления пользователями"""
    # Перенаправляем на существующий обработчик управления админами
    await admin_management(message)

# Обработчик кнопки "Список админов"
@router.message(F.text == "📜 Список админов", is_superadmin_filter)
async def list_admins(message: Message):
    """Показывает список всех админов"""
    admins = db.get_all_admins()
    
    if not admins:
        await message.answer(
            "📭 Список админов пуст.",
            reply_markup=keyboards.get_admin_management_keyboard()
        )
        return
    
    await message.answer(
        f"👥 <b>Список админов ({len(admins)})</b>\n\n"
        f"Выберите админа для просмотра деталей:",
        reply_markup=keyboards.get_admins_list_keyboard(admins)
    )

# Обработчик кнопки "Назад к управлению админами"
@router.callback_query(F.data == "back_to_admin_management")
async def back_to_admin_management(callback: CallbackQuery):
    """Возврат к меню управления админами"""
    await callback.message.edit_text(
        "👥 <b>Управление админами</b>\n\n"
        "Выберите действие из меню ниже:"
    )
    await callback.message.answer(
        "Выбери действие:",
        reply_markup=keyboards.get_admin_management_keyboard()
    )
    
    await callback.answer()

# Обработчик кнопки "Добавить админа"
@router.message(F.text == "➕ Добавить админа", is_superadmin_filter)
async def add_admin_start(message: Message, state: FSMContext):
    """Начинает процесс добавления нового админа"""
    await state.set_state(AdminStates.waiting_for_admin_id)
    
    await message.answer(
        "👤 <b>Добавление нового админа</b>\n\n"
        "Введите Telegram ID или username нового админа:"
    )

# Обработчик ввода Telegram ID нового админа
@router.message(StateFilter(AdminStates.waiting_for_admin_id))
async def process_admin_id(message: Message, state: FSMContext):
    """Обрабатывает ввод Telegram ID нового админа"""
    admin_id = message.text.strip()
    
    # Проверяем формат (ID или username)
    if admin_id.isdigit():
        # Это числовой ID
        telegram_id = admin_id
    elif admin_id.startswith('@'):
        # Это username - предупреждаем, что нужен ID
        await message.answer(
            "⚠️ К сожалению, добавление админа по username не поддерживается. "
            "Введите числовой Telegram ID пользователя."
        )
        return
    else:
        await message.answer(
            "❌ Некорректный формат. Введите числовой Telegram ID пользователя."
        )
        return
    
    # Проверяем, существует ли уже такой админ
    existing_admin = db.get_admin_by_telegram_id(telegram_id)
    if existing_admin and existing_admin['is_active']:
        await message.answer(
            "❌ Этот пользователь уже является админом.",
            reply_markup=keyboards.get_admin_management_keyboard()
        )
        await state.clear()
        return
    
    # Сохраняем ID в состоянии
    await state.update_data(admin_telegram_id=telegram_id)
    
    # Переходим к вводу имени
    await state.set_state(AdminStates.waiting_for_admin_name)
    
    await message.answer(
        "👤 Введите имя нового админа:"
    )

# Обработчик ввода имени нового админа
@router.message(StateFilter(AdminStates.waiting_for_admin_name))
async def process_admin_name(message: Message, state: FSMContext):
    """Обрабатывает ввод имени нового админа"""
    admin_name = message.text.strip()
    
    if not admin_name:
        await message.answer("❌ Имя не может быть пустым. Введите имя админа:")
        return
    
    # Сохраняем имя в состоянии
    await state.update_data(admin_name=admin_name)
    
    # Переходим к подтверждению
    await state.set_state(AdminStates.waiting_for_admin_confirmation)
    
    # Получаем данные для подтверждения
    data = await state.get_data()
    
    await message.answer(
        f"👤 <b>Подтверждение добавления админа</b>\n\n"
        f"<b>Telegram ID:</b> {data['admin_telegram_id']}\n"
        f"<b>Имя:</b> {data['admin_name']}\n\n"
        f"Подтвердите добавление нового админа:",
        reply_markup=keyboards.get_confirm_keyboard()
    )

# Обработчик подтверждения добавления админа
@router.callback_query(StateFilter(AdminStates.waiting_for_admin_confirmation))
async def confirm_add_admin(callback: CallbackQuery, state: FSMContext):
    """Подтверждает добавление нового админа"""
    if callback.data == "confirm":
        # Получаем данные из состояния
        data = await state.get_data()
        
        # Добавляем нового админа
        success = db.add_admin(
            telegram_id=data['admin_telegram_id'],
            full_name=data['admin_name'],
            created_by=str(callback.from_user.id)
        )
        
        if success:
            # Отправляем уведомление новому админу
            try:
                await callback.bot.send_message(
                    chat_id=data['admin_telegram_id'],
                    text=f"🎉 <b>Поздравляем!</b>\n\n"
                         f"Вы назначены администратором бота OFS Global.\n"
                         f"Для входа в панель администратора отправьте команду /admin"
                )
            except Exception as e:
                logger.error(f"Ошибка при отправке уведомления новому админу: {e}")
            
            await callback.message.edit_text(
                f"✅ Админ успешно добавлен!\n\n"
                f"<b>Telegram ID:</b> {data['admin_telegram_id']}\n"
                f"<b>Имя:</b> {data['admin_name']}"
            )
            
            await callback.message.answer(
                "Выбери дальнейшее действие:",
                reply_markup=keyboards.get_admin_management_keyboard()
            )
        else:
            await callback.message.edit_text(
                "❌ Не удалось добавить админа. Попробуйте позже."
            )
    else:  # cancel
        await callback.message.edit_text(
            "❌ Добавление админа отменено."
        )
        
        await callback.message.answer(
            "Выбери дальнейшее действие:",
            reply_markup=keyboards.get_admin_management_keyboard()
        )
    
    # Очищаем состояние
    await state.clear()
    await callback.answer()

# Обработчик кнопки "Назад к админке"
@router.message(F.text == "◀️ Назад к админке", is_admin_filter)
async def back_to_admin_panel(message: Message):
    """Возврат в главное меню админки"""
    await message.answer(
        "👑 <b>Админ-панель</b>\n\n"
        f"Привет, {message.from_user.first_name}! Ты вошел в админ-панель бота.\n"
        f"Используй кнопки для навигации.",
        reply_markup=keyboards.get_admin_keyboard()
    )

# Обработчик кнопки "Главное меню"
@router.message(F.text == "🏠 Главное меню")
async def main_menu_from_admin(message: Message):
    """Возврат в главное меню бота"""
    await message.answer(
        f"👋 Привет, {message.from_user.first_name}!\n"
        f"Используй меню для навигации.",
        reply_markup=keyboards.get_main_keyboard()
    )

# Обработчик кнопки "Сотрудники"
@router.message(F.text == "🧑‍💼 Сотрудники", is_admin_filter)
async def show_employees(message: Message):
    """Отображает список сотрудников"""
    employees = db.get_all_employees()
    
    if not employees:
        await message.answer(
            "📭 Список сотрудников пуст.",
            reply_markup=keyboards.get_admin_keyboard()
        )
        return
    
    await message.answer(
        f"👥 <b>Список сотрудников ({len(employees)})</b>\n\n"
        f"Выберите сотрудника для просмотра деталей:",
        reply_markup=keyboards.get_employees_list_keyboard(employees)
    )

# Обработчик кнопки "Удалить админа"
@router.message(F.text == "➖ Удалить админа", is_superadmin_filter)
async def remove_admin_start(message: Message):
    """Начинает процесс удаления админа"""
    admins = db.get_all_admins()
    
    # Фильтруем только активных админов, кроме текущего
    active_admins = [
        admin for admin in admins 
        if admin['is_active'] and str(admin['telegram_id']) != str(message.from_user.id)
    ]
    
    if not active_admins:
        await message.answer(
            "📭 Нет активных админов для удаления.",
            reply_markup=keyboards.get_admin_management_keyboard()
        )
        return
    
    await message.answer(
        f"👥 <b>Удаление админа</b>\n\n"
        f"Выберите админа для удаления:",
        reply_markup=keyboards.get_admins_list_keyboard(active_admins)
    )

# Обработчик выбора админа для действий
@router.callback_query(F.data.startswith("admin_"))
async def admin_actions(callback: CallbackQuery):
    """Показывает действия с выбранным админом"""
    admin_id = callback.data.split("_")[1]
    
    # Получаем данные админа
    admin = db.get_admin_by_telegram_id(admin_id)
    
    if not admin:
        await callback.message.edit_text(
            "❌ Админ не найден.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Админ не найден")
        return
    
    # Формируем текст с данными админа
    level = "Супер-админ" if admin['permission_level'] == 2 else "Админ"
    status = "Активен" if admin['is_active'] else "Неактивен"
    
    text = (
        f"👤 <b>Админ: {admin['full_name']}</b>\n\n"
        f"<b>Telegram ID:</b> {admin['telegram_id']}\n"
        f"<b>Username:</b> {admin.get('username', 'Не указан')}\n"
        f"<b>Уровень доступа:</b> {level}\n"
        f"<b>Статус:</b> {status}\n"
        f"<b>Дата добавления:</b> {admin['created_at']}\n\n"
        f"Выберите действие:"
    )
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboards.get_admin_action_keyboard(admin_id)
    )
    
    await callback.answer()

# Обработчик кнопки "Назад к списку админов"
@router.callback_query(F.data == "back_to_admins_list")
async def back_to_admins_list(callback: CallbackQuery):
    """Возврат к списку админов"""
    admins = db.get_all_admins()
    
    await callback.message.edit_text(
        f"👥 <b>Список админов ({len(admins)})</b>\n\n"
        f"Выберите админа для просмотра деталей:",
        reply_markup=keyboards.get_admins_list_keyboard(admins)
    )
    
    await callback.answer()

# Обработчик кнопки "Удалить админа"
@router.callback_query(F.data.startswith("remove_admin_"))
async def remove_admin(callback: CallbackQuery):
    """Удаляет выбранного админа"""
    admin_id = callback.data.split("_")[2]
    
    # Проверяем, не пытается ли админ удалить сам себя
    if str(admin_id) == str(callback.from_user.id):
        await callback.message.edit_text(
            "❌ Вы не можете удалить сами себя.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Операция запрещена")
        return
    
    # Получаем данные админа
    admin = db.get_admin_by_telegram_id(admin_id)
    
    if not admin:
        await callback.message.edit_text(
            "❌ Админ не найден.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Админ не найден")
        return
    
    # Проверяем, не пытается ли обычный админ удалить супер-админа
    if admin['permission_level'] == 2 and not db.is_superadmin(str(callback.from_user.id)):
        await callback.message.edit_text(
            "❌ У вас недостаточно прав для удаления супер-админа.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Недостаточно прав")
        return
    
    # Удаляем админа
    success = db.remove_admin(admin_id)
    
    if success:
        # Отправляем уведомление удаленному админу
        try:
            await callback.bot.send_message(
                chat_id=admin_id,
                text="⚠️ <b>Уведомление</b>\n\n"
                     "Ваши права администратора бота OFS Global были отозваны."
            )
        except Exception as e:
            logger.error(f"Ошибка при отправке уведомления удаленному админу: {e}")
        
        await callback.message.edit_text(
            f"✅ Админ {admin['full_name']} успешно удален.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
    else:
        await callback.message.edit_text(
            "❌ Не удалось удалить админа. Попробуйте позже.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
    
    await callback.answer()

# Обработчик кнопки "Статистика админа"
@router.callback_query(F.data.startswith("admin_stats_"))
async def admin_stats(callback: CallbackQuery):
    """Показывает статистику выбранного админа"""
    admin_id = callback.data.split("_")[2]
    
    # Получаем данные админа
    admin = db.get_admin_by_telegram_id(admin_id)
    
    if not admin:
        await callback.message.edit_text(
            "❌ Админ не найден.",
            reply_markup=keyboards.get_back_to_main_keyboard()
        )
        await callback.answer("Админ не найден")
        return
    
    # Получаем статистику админа
    stats = db.get_admin_stats(admin_id)
    
    # Формируем текст со статистикой
    text = (
        f"📊 <b>Статистика админа: {admin['full_name']}</b>\n\n"
        f"<b>Обработано заявок:</b> {stats['processed_requests']}\n"
        f"<b>Одобрено заявок:</b> {stats['approved_requests']}\n"
        f"<b>Отклонено заявок:</b> {stats['rejected_requests']}\n"
        f"<b>Сгенерировано кодов:</b> {stats['generated_codes']}\n"
        f"<b>Использовано кодов:</b> {stats['used_codes']}"
    )
    
    await callback.message.edit_text(
        text,
        reply_markup=keyboards.get_admins_list_keyboard(db.get_all_admins())
    )
    
    await callback.answer()

async def send_invitation_to_user(
    request_id: int, 
    invitation_code: str, 
    position_name: str, 
    division_name: str = None
):
    """
    Отправляет код приглашения пользователю
    
    Args:
        request_id: ID заявки
        invitation_code: Код приглашения
        position_name: Название должности
        division_name: Название отдела (опционально)
    """
    request = db.get_registration_request(request_id)
    if not request:
        logger.error(f"Не удалось найти заявку с ID {request_id}")
        return
    
    # Формируем сообщение для пользователя
    user_message = (
        f"✅ <b>Заявка одобрена!</b>\n\n"
        f"Твоя заявка на регистрацию была одобрена администратором.\n\n"
        f"<b>Должность:</b> {position_name}\n"
    )
    
    if division_name:
        user_message += f"<b>Отдел:</b> {division_name}\n\n"
    else:
        user_message += "\n"
    
    user_message += (
        f"Для завершения регистрации используй следующий код приглашения:\n\n"
        f"<code>{invitation_code}</code>\n\n"
        f"Код действителен в течение 24 часов."
    )
    
    try:
        from aiogram import Bot
        
        # Создаем экземпляр бота для отправки сообщения
        bot = Bot(token=config.BOT_TOKEN)
        
        await bot.send_message(
            chat_id=request['telegram_id'],
            text=user_message,
            parse_mode="HTML"
        )
        logger.info(f"Отправлен код приглашения пользователю {request['telegram_id']}")
        
        # Закрываем бота после отправки
        await bot.session.close()
    except Exception as e:
        logger.error(f"Ошибка при отправке кода приглашения пользователю {request['telegram_id']}: {e}")

def register_admin_handlers(dispatcher: Router):
    """Регистрирует все обработчики админских команд"""
    dispatcher.include_router(router) 