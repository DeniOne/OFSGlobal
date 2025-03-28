from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP

from app.db.base_class import Base


class Staff(Base):
    """
    Модель данных сотрудника организации.
    Содержит все персональные данные сотрудника, включая контактную информацию и документы.
    """
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    
    # Основная информация
    name = Column(String(255), nullable=False, index=True, comment="ФИО сотрудника")
    position = Column(String(255), nullable=False, comment="Должность")
    division = Column(String(255), nullable=False, index=True, comment="Подразделение")
    level = Column(Integer, nullable=False, default=0, comment="Уровень иерархии (1-высший, 2-средний, 3-базовый)")
    
    # Организация
    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    
    # Фото и контактная информация
    photo_path = Column(String(255), nullable=True, comment="Путь к файлу с фотографией")
    phone = Column(String(20), nullable=True, comment="Телефон")
    email = Column(String(255), nullable=True, unique=True, index=True, comment="Email")
    telegram_id = Column(String(255), nullable=True, comment="ID Telegram")
    
    # Адреса
    registration_address = Column(Text, nullable=True, comment="Адрес регистрации")
    actual_address = Column(Text, nullable=True, comment="Фактический адрес")
    
    # Документы
    passport_path = Column(String(255), nullable=True, comment="Путь к файлу с паспортом")
    work_contract_path = Column(String(255), nullable=True, comment="Путь к файлу с трудовым договором")
    
    # Служебная информация
    is_active = Column(Boolean, default=True, nullable=False, comment="Активен/Уволен")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Отношения
    organization = relationship("Organization", back_populates="staff")
    parent = relationship("Staff", remote_side=[id], back_populates="children", uselist=False)
    children = relationship("Staff", back_populates="parent", remote_side=[parent_id])
    
    # Функциональные связи (матричная структура)
    functional_reports_to = relationship(
        "FunctionalRelation",
        foreign_keys="FunctionalRelation.subordinate_id",
        back_populates="subordinate"
    )
    functional_manager_of = relationship(
        "FunctionalRelation",
        foreign_keys="FunctionalRelation.manager_id",
        back_populates="manager"
    )
    
    def __repr__(self):
        return f"<Staff {self.name}, {self.position}>" 