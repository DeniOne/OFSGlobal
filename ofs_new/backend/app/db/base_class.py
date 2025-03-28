from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    """
    Базовый класс для всех моделей SQLAlchemy.
    Предоставляет атрибут id и функцию автогенерации имени таблицы.
    """
    id: Any
    __name__: str
    
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Автоматическое генерирование имени таблицы на основе имени класса.
        """
        return cls.__name__.lower() 