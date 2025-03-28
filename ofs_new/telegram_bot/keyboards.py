from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from typing import List

def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Создает основную клавиатуру бота"""
    kb = [
        [KeyboardButton(text="📝 Регистрация"), KeyboardButton(text="❓ Помощь")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)

def get_competencies_keyboard() -> InlineKeyboardMarkup:
    """Создает клавиатуру для выбора компетенций"""
    competencies = [
        "Python", "JavaScript", "SQL", "HTML/CSS", 
        "React", "Vue.js", "Django", "FastAPI",
        "Docker", "Kubernetes", "CI/CD", "Git",
        "Project Management", "Testing", "DevOps", "Data Analysis"
    ]
    
    kb = []
    row = []
    
    for i, comp in enumerate(competencies):
        row.append(InlineKeyboardButton(text=comp, callback_data=comp))
        if (i + 1) % 2 == 0 or i == len(competencies) - 1:
            kb.append(row)
            row = []
    
    kb.append([
        InlineKeyboardButton(text="✅ Готово", callback_data="confirm_competencies"),
        InlineKeyboardButton(text="🗑 Очистить", callback_data="clear_competencies")
    ])
    
    return InlineKeyboardMarkup(inline_keyboard=kb)

def get_departments_keyboard() -> InlineKeyboardMarkup:
    """Создает клавиатуру для выбора департамента"""
    departments = [
        "Разработка", "Маркетинг", "Продажи", 
        "HR", "Финансы", "Операционный"
    ]
    
    kb = []
    for dept in departments:
        kb.append([InlineKeyboardButton(text=dept, callback_data=f"dept_{dept}")])
    
    kb.append([InlineKeyboardButton(text="Отмена", callback_data="cancel_dept")])
    
    return InlineKeyboardMarkup(inline_keyboard=kb)

def get_divisions_keyboard(department: str) -> InlineKeyboardMarkup:
    """Создает клавиатуру для выбора отдела"""
    divisions = {
        "Разработка": ["Backend", "Frontend", "Mobile", "QA", "DevOps"],
        "Маркетинг": ["Digital", "PR", "Content", "Analytics"],
        "Продажи": ["B2B", "B2C", "Key Accounts"],
        "HR": ["Recruitment", "Training", "Employee Relations"],
        "Финансы": ["Accounting", "Financial Planning", "Payroll"],
        "Операционный": ["Logistics", "Purchasing", "Facilities"]
    }
    
    kb = []
    for div in divisions.get(department, []):
        kb.append([InlineKeyboardButton(text=div, callback_data=f"div_{div}")])
    
    kb.append([InlineKeyboardButton(text="Назад", callback_data="back_to_dept")])
    kb.append([InlineKeyboardButton(text="Отмена", callback_data="cancel_div")])
    
    return InlineKeyboardMarkup(inline_keyboard=kb)

def get_functions_keyboard(division: str) -> InlineKeyboardMarkup:
    """Создает клавиатуру для выбора функции"""
    functions = {
        "Backend": ["API Development", "Database Design", "System Architecture"],
        "Frontend": ["UI Development", "UX Design", "Client Integration"],
        "Mobile": ["Android", "iOS", "Cross-platform"],
        "QA": ["Manual Testing", "Automation", "Performance Testing"],
        "DevOps": ["CI/CD", "Infrastructure", "Monitoring"]
        # Другие функции для других отделов можно добавить аналогично
    }
    
    kb = []
    for func in functions.get(division, []):
        kb.append([InlineKeyboardButton(text=func, callback_data=f"func_{func}")])
    
    kb.append([InlineKeyboardButton(text="Назад", callback_data="back_to_div")])
    kb.append([InlineKeyboardButton(text="Отмена", callback_data="cancel_func")])
    
    return InlineKeyboardMarkup(inline_keyboard=kb)

def get_confirm_keyboard() -> InlineKeyboardMarkup:
    """Создает клавиатуру для подтверждения данных"""
    kb = [
        [
            InlineKeyboardButton(text="✅ Подтвердить", callback_data="confirm"),
            InlineKeyboardButton(text="❌ Отменить", callback_data="cancel")
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=kb)

def get_admin_keyboard() -> ReplyKeyboardMarkup:
    """Создание клавиатуры для администратора"""
    keyboard = [
        [KeyboardButton(text="Просмотр заявок")],
        [KeyboardButton(text="Статистика")],
        [KeyboardButton(text="Настройки")]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True
    )

def get_employee_actions_keyboard() -> InlineKeyboardMarkup:
    """Создание клавиатуры действий с сотрудником"""
    buttons = [
        [
            InlineKeyboardButton(
                text="✅ Подтвердить",
                callback_data="action_approve"
            ),
            InlineKeyboardButton(
                text="❌ Отклонить",
                callback_data="action_reject"
            )
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons) 