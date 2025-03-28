from typing import Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class RelationType(str, Enum):
    FUNCTIONAL = "functional"
    ADMINISTRATIVE = "administrative"
    PROJECT = "project"
    TERRITORIAL = "territorial"
    MENTORING = "mentoring"


# Базовая схема для функциональных отношений
class FunctionalRelationBase(BaseModel):
    subordinate_id: int
    relation_type: RelationType = RelationType.FUNCTIONAL
    description: Optional[str] = None


# Схема для создания функциональной связи
class FunctionalRelationCreate(FunctionalRelationBase):
    pass


# Схема для обновления функциональной связи
class FunctionalRelationUpdate(FunctionalRelationBase):
    subordinate_id: Optional[int] = None
    relation_type: Optional[RelationType] = None


# Схема для чтения данных функциональной связи
class FunctionalRelation(FunctionalRelationBase):
    id: int
    manager_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 