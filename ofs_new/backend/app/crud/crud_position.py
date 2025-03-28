from typing import List, Dict, Any, Optional, Union
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.position import Position
from app.schemas.position import PositionCreate, PositionUpdate


class CRUDPosition(CRUDBase[Position, PositionCreate, PositionUpdate]):
    """
    CRUD операции с должностями.
    """
    
    def get_by_name(self, db: Session, *, name: str) -> Optional[Position]:
        """
        Получить должность по названию.
        """
        return db.query(Position).filter(Position.name == name).first()
    
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, 
        name: Optional[str] = None, active: Optional[bool] = None
    ) -> List[Position]:
        """
        Получить список должностей с возможностью фильтрации.
        """
        query = db.query(self.model)
        
        if name:
            query = query.filter(Position.name.ilike(f"%{name}%"))
        
        if active is not None:
            query = query.filter(Position.is_active == active)
        
        return query.offset(skip).limit(limit).all()


crud_position = CRUDPosition(Position) 