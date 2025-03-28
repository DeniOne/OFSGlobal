from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Division(Base):
    """
    Модель подразделения в организации.
    """
    __tablename__ = "divisions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(20), nullable=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    level = Column(Integer, nullable=True)
    
    # Отношения
    organization_id = Column(Integer, ForeignKey("organization.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(Integer, ForeignKey("divisions.id", ondelete="SET NULL"), nullable=True)
    
    # Отношения для ORM
    organization = relationship("Organization", back_populates="divisions")
    parent = relationship("Division", remote_side=[id], backref="children") 