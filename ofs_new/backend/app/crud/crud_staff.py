from typing import Any, Dict, Optional, Union, List
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffUpdate


class CRUDStaff(CRUDBase[Staff, StaffCreate, StaffUpdate]):
    def get_multi_by_organization(
        self, db: Session, *, organization_id: int, skip: int = 0, limit: int = 100
    ) -> List[Staff]:
        """
        Получить всех сотрудников организации
        """
        return (
            db.query(self.model)
            .filter(Staff.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_division(
        self, db: Session, *, division: str, skip: int = 0, limit: int = 100
    ) -> List[Staff]:
        """
        Получить всех сотрудников подразделения
        """
        return (
            db.query(self.model)
            .filter(Staff.division == division)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, filters: Dict = None
    ) -> List[Staff]:
        """
        Получить список сотрудников с применением фильтров
        """
        query = db.query(self.model)
        
        if filters:
            if "organization_id" in filters and filters["organization_id"] is not None:
                query = query.filter(Staff.organization_id == filters["organization_id"])
                
            if "division" in filters and filters["division"] is not None:
                query = query.filter(Staff.division == filters["division"])
                
            if "is_active" in filters:
                query = query.filter(Staff.is_active == filters["is_active"])
        
        return query.offset(skip).limit(limit).all()

    def get_direct_reports(self, db: Session, *, staff_id: int) -> List[Staff]:
        """
        Получить прямых подчиненных сотрудника
        """
        return db.query(self.model).filter(Staff.parent_id == staff_id).all()

    def create_with_organization(
        self, db: Session, *, obj_in: StaffCreate, organization_id: int
    ) -> Staff:
        """
        Создать сотрудника с привязкой к организации
        """
        obj_in_data = jsonable_encoder(obj_in)
        obj_in_data["organization_id"] = organization_id
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_email(self, db: Session, *, email: str) -> Optional[Staff]:
        """
        Получить сотрудника по email
        """
        return db.query(self.model).filter(Staff.email == email).first()


staff = CRUDStaff(Staff) 