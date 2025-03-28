from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator, Field


# Базовая схема для сотрудника
class StaffBase(BaseModel):
    name: str
    position: str
    division: str  # Заменено с department на division
    level: Optional[int] = 0
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    telegram_id: Optional[str] = None
    registration_address: Optional[str] = None
    actual_address: Optional[str] = None
    photo_path: Optional[str] = None
    passport_path: Optional[str] = None
    work_contract_path: Optional[str] = None
    is_active: Optional[bool] = True
    
    @validator('phone')
    def validate_phone(cls, v):
        """Валидация формата телефонного номера"""
        if v is None:
            return v
        
        # Удаляем все нецифровые символы
        digits_only = ''.join(filter(str.isdigit, v))
        
        # Проверяем на типичную длину телефонного номера
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValueError('Телефонный номер должен содержать от 10 до 15 цифр')
        
        return v
    
    @validator('telegram_id')
    def validate_telegram(cls, v):
        """Валидация формата идентификатора Telegram"""
        if v is None:
            return v
        
        # Убираем символ @ если он есть в начале
        if v.startswith('@'):
            v = v[1:]
        
        # Проверяем минимальную длину
        if len(v) < 5:
            raise ValueError('Telegram ID должен содержать не менее 5 символов')
        
        return v


# Схема для создания сотрудника
class StaffCreate(StaffBase):
    organization_id: int
    parent_id: Optional[int] = None


# Схема для обновления данных сотрудника
class StaffUpdate(StaffBase):
    name: Optional[str] = None
    position: Optional[str] = None
    division: Optional[str] = None  # Заменено с department на division
    organization_id: Optional[int] = None
    parent_id: Optional[int] = None


# Схема для чтения данных сотрудника
class Staff(StaffBase):
    id: int
    organization_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Полная схема сотрудника в БД
class StaffInDB(Staff):
    pass


# Расширенная схема с функциональными связями
class StaffWithRelations(Staff):
    functional_subordinates: Optional[List] = []
    functional_managers: Optional[List] = []
    direct_reports: Optional[List] = [] 