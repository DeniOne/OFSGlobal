from typing import Any, Dict, Optional, Union, List
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


class CRUDEmployee(CRUDBase[Employee, EmployeeCreate, EmployeeUpdate]):
    def get_multi_by_organization(
        self, db: Session, *, organization_id: int, skip: int = 0, limit: int = 100
    ) -> List[Employee]:
        """
        Получить всех сотрудников организации
        """
        return (
            db.query(self.model)
            .filter(Employee.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_department(
        self, db: Session, *, department: str, skip: int = 0, limit: int = 100
    ) -> List[Employee]:
        """
        Получить всех сотрудников отдела
        """
        return (
            db.query(self.model)
            .filter(Employee.department == department)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, filters: Dict = None
    ) -> List[Employee]:
        """
        Получить список сотрудников с применением фильтров
        """
        query = db.query(self.model)
        
        if filters:
            if "organization_id" in filters and filters["organization_id"] is not None:
                query = query.filter(Employee.organization_id == filters["organization_id"])
                
            if "department" in filters and filters["department"] is not None:
                query = query.filter(Employee.department == filters["department"])
                
            if "is_active" in filters:
                query = query.filter(Employee.is_active == filters["is_active"])
        
        return query.offset(skip).limit(limit).all()

    def get_direct_reports(self, db: Session, *, employee_id: int) -> List[Employee]:
        """
        Получить прямых подчиненных сотрудника
        """
        return db.query(self.model).filter(Employee.parent_id == employee_id).all()

    def create_with_organization(
        self, db: Session, *, obj_in: EmployeeCreate, organization_id: int
    ) -> Employee:
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

    def get_by_email(self, db: Session, *, email: str) -> Optional[Employee]:
        """
        Получить сотрудника по email
        """
        return db.query(self.model).filter(Employee.email == email).first()


employee = CRUDEmployee(Employee) 