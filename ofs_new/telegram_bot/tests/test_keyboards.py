import pytest
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

from ..keyboards import (
    get_main_keyboard,
    get_competencies_keyboard,
    get_departments_keyboard,
    get_divisions_keyboard,
    get_functions_keyboard,
    get_confirm_keyboard
)

def test_get_main_keyboard():
    """Тест главной клавиатуры"""
    keyboard = get_main_keyboard()
    
    # Проверяем, что клавиатура создана
    assert isinstance(keyboard, InlineKeyboardMarkup)
    
    # Проверяем кнопки
    buttons = keyboard.inline_keyboard[0]
    assert len(buttons) == 2
    assert buttons[0].text == "📝 Регистрация"
    assert buttons[1].text == "❓ Помощь"

def test_get_competencies_keyboard():
    """Тест клавиатуры компетенций"""
    competencies = ["Python", "SQL", "Git"]
    keyboard = get_competencies_keyboard(competencies)
    
    # Проверяем, что клавиатура создана
    assert isinstance(keyboard, InlineKeyboardMarkup)
    
    # Проверяем кнопки
    buttons = keyboard.inline_keyboard[0]
    assert len(buttons) == len(competencies)
    for i, comp in enumerate(competencies):
        assert buttons[i].text == comp
        assert buttons[i].callback_data == f"comp_{comp}"

def test_get_departments_keyboard():
    """Тест клавиатуры департаментов"""
    departments = ["IT", "HR", "Finance"]
    keyboard = get_departments_keyboard(departments)
    
    # Проверяем, что клавиатура создана
    assert isinstance(keyboard, InlineKeyboardMarkup)
    
    # Проверяем кнопки
    buttons = keyboard.inline_keyboard[0]
    assert len(buttons) == len(departments)
    for i, dept in enumerate(departments):
        assert buttons[i].text == dept
        assert buttons[i].callback_data == f"dept_{dept}"

def test_get_divisions_keyboard():
    """Тест клавиатуры отделов"""
    divisions = ["Development", "QA", "DevOps"]
    keyboard = get_divisions_keyboard(divisions)
    
    # Проверяем, что клавиатура создана
    assert isinstance(keyboard, InlineKeyboardMarkup)
    
    # Проверяем кнопки
    buttons = keyboard.inline_keyboard[0]
    assert len(buttons) == len(divisions)
    for i, div in enumerate(divisions):
        assert buttons[i].text == div
        assert buttons[i].callback_data == f"div_{div}"

def test_get_functions_keyboard():
    """Тест клавиатуры функций"""
    functions = ["Backend", "Frontend", "Testing"]
    keyboard = get_functions_keyboard(functions)
    
    # Проверяем, что клавиатура создана
    assert isinstance(keyboard, InlineKeyboardMarkup)
    
    # Проверяем кнопки
    buttons = keyboard.inline_keyboard[0]
    assert len(buttons) == len(functions)
    for i, func in enumerate(functions):
        assert buttons[i].text == func
        assert buttons[i].callback_data == f"func_{func}"

def test_get_confirm_keyboard():
    """Тест клавиатуры подтверждения"""
    keyboard = get_confirm_keyboard()
    
    # Проверяем, что клавиатура создана
    assert isinstance(keyboard, InlineKeyboardMarkup)
    
    # Проверяем кнопки
    buttons = keyboard.inline_keyboard[0]
    assert len(buttons) == 2
    assert buttons[0].text == "✅ Подтвердить"
    assert buttons[1].text == "❌ Отменить"
    assert buttons[0].callback_data == "confirm_yes"
    assert buttons[1].callback_data == "confirm_no" 