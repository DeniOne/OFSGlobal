from typing import List, Optional
from pydantic import BaseModel, Field, validator


class DepartmentBase(BaseModel):
    """
    Базовые атрибуты для отделов.
    """
    name: str = Field(..., description="Название отдела", min_length=1, max_length=100)
    code: Optional[str] = Field(None, description="Код отдела", max_length=20)
    description: Optional[str] = Field(None, description="Описание отдела", max_length=500)
    is_active: bool = Field(True, description="Активен ли отдел")
    level: Optional[int] = Field(None, description="Уровень отдела в иерархии (0 - компания, 1 - департамент, 2 - отдел, 3 - подразделение)")
    organization_id: int = Field(..., description="ID организации, к которой относится отдел")
    parent_id: Optional[int] = Field(None, description="ID родительского отдела")


class DepartmentCreate(DepartmentBase):
    """
    Атрибуты для создания нового отдела.
    """
    pass


class DepartmentUpdate(BaseModel):
    """
    Атрибуты, которые можно обновить у отдела.
    """
    name: Optional[str] = Field(None, description="Название отдела", min_length=1, max_length=100)
    code: Optional[str] = Field(None, description="Код отдела", max_length=20)
    description: Optional[str] = Field(None, description="Описание отдела", max_length=500)
    is_active: Optional[bool] = Field(None, description="Активен ли отдел")
    level: Optional[int] = Field(None, description="Уровень отдела в иерархии")
    organization_id: Optional[int] = Field(None, description="ID организации, к которой относится отдел")
    parent_id: Optional[int] = Field(None, description="ID родительского отдела")


class DepartmentInDB(DepartmentBase):
    """
    Дополнительные атрибуты, хранящиеся в БД.
    """
    id: int
    
    class Config:
        orm_mode = True


class Department(DepartmentInDB):
    """
    Дополнительные атрибуты, возвращаемые API.
    """
    children: List["Department"] = []
    
    class Config:
        orm_mode = True


class DepartmentTree(Department):
    children: List["DepartmentTree"] = []
    
    class Config:
        orm_mode = True


# Необходимо для корректной работы рекурсивных ссылок
DepartmentTree.update_forward_refs() 