from typing import Optional, List
from pydantic import BaseModel

from .department import Department


# Общие свойства
class OrganizationBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True


# Свойства для создания организации
class OrganizationCreate(OrganizationBase):
    name: str


# Свойства для обновления организации
class OrganizationUpdate(OrganizationBase):
    pass


# Свойства для организации в БД
class OrganizationInDBBase(OrganizationBase):
    id: int
    name: str

    class Config:
        orm_mode = True


# Свойства для API response
class Organization(OrganizationInDBBase):
    pass


# Дополнительные свойства для организации в БД
class OrganizationInDB(OrganizationInDBBase):
    pass


# Полная организация с отделами
class OrganizationWithDepartments(Organization):
    departments: List[Department] = [] 