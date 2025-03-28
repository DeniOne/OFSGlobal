from typing import Optional
from pydantic import BaseModel, Field


class PositionBase(BaseModel):
    """
    Базовые атрибуты для должностей.
    """
    name: str = Field(..., description="Название должности", min_length=1, max_length=100)
    description: Optional[str] = Field(None, description="Описание должности", max_length=500)
    is_active: bool = Field(True, description="Активна ли должность")


class PositionCreate(PositionBase):
    """
    Атрибуты для создания новой должности.
    """
    pass


class PositionUpdate(BaseModel):
    """
    Атрибуты, которые можно обновить у должности.
    """
    name: Optional[str] = Field(None, description="Название должности", min_length=1, max_length=100)
    description: Optional[str] = Field(None, description="Описание должности", max_length=500)
    is_active: Optional[bool] = Field(None, description="Активна ли должность")


class Position(PositionBase):
    """
    Дополнительные атрибуты, возвращаемые API.
    """
    id: int
    
    class Config:
        orm_mode = True 