from typing import Optional, List
from pydantic import BaseModel, EmailStr

from .item import Item


# Общие свойства
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None


# Свойства для создания пользователя
class UserCreate(UserBase):
    email: EmailStr
    password: str


# Свойства для обновления пользователя
class UserUpdate(UserBase):
    password: Optional[str] = None


# Свойства для пользователя в БД
class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        orm_mode = True


# Свойства дополнительные для ответа API
class User(UserInDBBase):
    pass


# Свойства, хранящиеся в БД
class UserInDB(UserInDBBase):
    hashed_password: str 