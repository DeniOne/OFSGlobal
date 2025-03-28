from typing import List, Optional
from pydantic import BaseModel, Field, validator


class DivisionBase(BaseModel):
    """
    Базовые атрибуты для подразделений.
    """
    name: str = Field(..., description="Название подразделения", min_length=1, max_length=100)
    code: Optional[str] = Field(None, description="Код подразделения", max_length=20)
    description: Optional[str] = Field(None, description="Описание подразделения", max_length=500)
    is_active: bool = Field(True, description="Активно ли подразделение")
    level: Optional[int] = Field(None, description="Уровень подразделения в иерархии (0 - компания, 1 - департамент, 2 - отдел, 3 - подразделение)")
    organization_id: int = Field(..., description="ID организации, к которой относится подразделение")
    parent_id: Optional[int] = Field(None, description="ID родительского подразделения")


class DivisionCreate(DivisionBase):
    """
    Атрибуты для создания нового подразделения.
    """
    pass


class DivisionUpdate(BaseModel):
    """
    Атрибуты, которые можно обновить у подразделения.
    """
    name: Optional[str] = Field(None, description="Название подразделения", min_length=1, max_length=100)
    code: Optional[str] = Field(None, description="Код подразделения", max_length=20)
    description: Optional[str] = Field(None, description="Описание подразделения", max_length=500)
    is_active: Optional[bool] = Field(None, description="Активно ли подразделение")
    level: Optional[int] = Field(None, description="Уровень подразделения в иерархии")
    organization_id: Optional[int] = Field(None, description="ID организации, к которой относится подразделение")
    parent_id: Optional[int] = Field(None, description="ID родительского подразделения")


class DivisionInDB(DivisionBase):
    """
    Дополнительные атрибуты, хранящиеся в БД.
    """
    id: int
    
    class Config:
        orm_mode = True


class Division(DivisionInDB):
    """
    Дополнительные атрибуты, возвращаемые API.
    """
    children: List["Division"] = []
    
    class Config:
        orm_mode = True


class DivisionTree(Division):
    children: List["DivisionTree"] = []
    
    class Config:
        orm_mode = True


# Необходимо для корректной работы рекурсивных ссылок
DivisionTree.update_forward_refs() 