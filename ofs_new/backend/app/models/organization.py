from typing import TYPE_CHECKING, List
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey, Integer

from app.db.base_class import Base

if TYPE_CHECKING:
    from .division import Division  # noqa: F401
    from .staff import Staff  # noqa: F401

class Organization(Base):
    """
    Модель организации.
    Верхний уровень иерархии в организационной структуре.
    """
    __tablename__ = "organization"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    divisions = relationship("Division", back_populates="organization", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="organization", cascade="all, delete-orphan") 