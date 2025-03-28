from typing import List, Dict, Any, Optional, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import true

from app.crud.base import CRUDBase
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import joinedload


class CRUDDepartment(CRUDBase[Department, DepartmentCreate, DepartmentUpdate]):
    """
    CRUD операции с отделами.
    """
    
    def get_by_name(self, db: Session, *, name: str, organization_id: int) -> Optional[Department]:
        """
        Получить отдел по названию и организации.
        """
        return db.query(Department).filter(
            Department.name == name,
            Department.organization_id == organization_id
        ).first()
    
    async def get_by_code(
        self, db: AsyncSession, *, code: str, organization_id: int
    ) -> Optional[Department]:
        """
        Получение отдела по коду в рамках указанной организации
        """
        result = await db.execute(
            select(Department)
            .where(
                and_(
                    Department.code == code,
                    Department.organization_id == organization_id
                )
            )
        )
        return result.scalars().first()
    
    def get_multi_by_organization(
        self, db: Session, *, organization_id: int, skip: int = 0, limit: int = 100,
        name: Optional[str] = None, code: Optional[str] = None, active: Optional[bool] = None,
        level: Optional[int] = None
    ) -> List[Department]:
        """
        Получить список отделов по организации с возможностью фильтрации.
        """
        query = db.query(self.model).filter(Department.organization_id == organization_id)
        
        if name:
            query = query.filter(Department.name.ilike(f"%{name}%"))
        
        if code:
            query = query.filter(Department.code.ilike(f"%{code}%"))
        
        if active is not None:
            query = query.filter(Department.is_active == active)
        
        if level is not None:
            query = query.filter(Department.level == level)
            
        return query.offset(skip).limit(limit).all()
    
    async def get_multi_by_organization(
        self, 
        db: AsyncSession, 
        *, 
        organization_id: int,
        parent_id: Optional[int] = None,
        include_inactive: bool = False,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Department]:
        """
        Получение отделов для указанной организации
        Если parent_id указан, возвращаются только дочерние отделы
        Если parent_id = None, возвращаются корневые отделы (без родителя)
        """
        filters = [Department.organization_id == organization_id]
        
        # Фильтрация по родительскому отделу
        filters.append(Department.parent_id == parent_id)
        
        # Фильтрация по активности
        if not include_inactive:
            filters.append(Department.is_active == True)
        
        result = await db.execute(
            select(Department)
            .where(and_(*filters))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    def get_children(self, db: Session, *, department_id: int, active_only: bool = False) -> List[Department]:
        """
        Получить все дочерние отделы для указанного отдела.
        """
        query = db.query(self.model).filter(Department.parent_id == department_id)
        
        if active_only:
            query = query.filter(Department.is_active == True)
            
        return query.all()
    
    async def get_children(
        self, 
        db: AsyncSession, 
        *, 
        department_id: int,
        include_inactive: bool = False
    ) -> List[Department]:
        """
        Получение прямых дочерних отделов для указанного отдела
        """
        filters = [Department.parent_id == department_id]
        
        if not include_inactive:
            filters.append(Department.is_active == True)
        
        result = await db.execute(
            select(Department)
            .where(and_(*filters))
        )
        return result.scalars().all()
    
    def get_root_departments(self, db: Session, *, organization_id: int) -> List[Department]:
        """
        Получить корневые отделы организации (без родительского отдела).
        """
        return db.query(self.model).filter(
            Department.organization_id == organization_id,
            Department.parent_id == None
        ).all()
    
    async def get_all_descendants(
        self, 
        db: AsyncSession, 
        *, 
        department_id: int,
        include_inactive: bool = False
    ) -> List[Department]:
        """
        Получение всех потомков отдела (всех уровней иерархии)
        """
        # Получаем прямых потомков
        children = await self.get_children(db, department_id=department_id, include_inactive=include_inactive)
        
        descendants = list(children)  # Копируем список чтобы не менять его при проходе
        
        # Для каждого дочернего отдела получаем его потомков
        for child in children:
            child_descendants = await self.get_all_descendants(
                db, department_id=child.id, include_inactive=include_inactive
            )
            descendants.extend(child_descendants)
        
        return descendants
    
    async def get_department_tree(
        self, 
        db: AsyncSession, 
        *, 
        organization_id: int,
        include_inactive: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Построение дерева отделов для организации
        """
        # Получаем все отделы организации
        filters = [Department.organization_id == organization_id]
        if not include_inactive:
            filters.append(Department.is_active == True)
            
        result = await db.execute(
            select(Department)
            .where(and_(*filters))
            .order_by(Department.level)
        )
        all_departments = result.scalars().all()
        
        # Строим дерево отделов
        departments_by_id = {dept.id: dept for dept in all_departments}
        tree = []
        for dept in all_departments:
            # Устанавливаем дочерние отделы
            dept_dict = jsonable_encoder(dept)
            dept_dict["children"] = []
            
            # Если отдел без родителя, добавляем в корень дерева
            if dept.parent_id is None:
                tree.append(dept_dict)
            # Иначе добавляем как дочерний
            elif dept.parent_id in departments_by_id:
                parent = departments_by_id[dept.parent_id]
                # Находим родителя в дереве
                parent_dict = None
                for d in tree:
                    if d["id"] == parent.id:
                        parent_dict = d
                        break
                
                # Если родитель найден, добавляем к нему
                if parent_dict:
                    parent_dict["children"].append(dept_dict)
                # Иначе родитель может быть на более глубоком уровне
                else:
                    # Рекурсивный поиск родителя в дереве
                    def find_parent_and_add_child(nodes, child_dict):
                        for node in nodes:
                            if node["id"] == parent.id:
                                node["children"].append(child_dict)
                                return True
                            if find_parent_and_add_child(node["children"], child_dict):
                                return True
                        return False
                    
                    find_parent_and_add_child(tree, dept_dict)
        
        return tree
    
    async def create_with_parent(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: BaseModel,
        parent_id: Optional[int] = None
    ) -> Department:
        """
        Создание отдела с учетом родительского отдела
        """
        obj_in_data = jsonable_encoder(obj_in)
        level = 0  # Уровень по умолчанию для корневых отделов
        
        # Если указан parent_id, устанавливаем правильный уровень
        if parent_id is not None:
            parent = await self.get(db, id=parent_id)
            if parent:
                level = parent.level + 1
                obj_in_data["parent_id"] = parent_id
        
        obj_in_data["level"] = level
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update_with_children(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: Department,
        obj_in: Union[BaseModel, Dict[str, Any]]
    ) -> Department:
        """
        Обновление отдела с обновлением дочерних отделов, если необходимо
        """
        old_is_active = db_obj.is_active
        updated_obj = await self.update(db, db_obj=db_obj, obj_in=obj_in)
        
        # Если изменилась активность, обновляем и дочерние отделы
        if isinstance(obj_in, dict) and "is_active" in obj_in and old_is_active != obj_in["is_active"]:
            await self._update_children_activity(db, parent_id=db_obj.id, is_active=obj_in["is_active"])
        elif hasattr(obj_in, "is_active") and obj_in.is_active is not None and old_is_active != obj_in.is_active:
            await self._update_children_activity(db, parent_id=db_obj.id, is_active=obj_in.is_active)
            
        return updated_obj

    async def _update_children_activity(
        self, 
        db: AsyncSession, 
        *, 
        parent_id: int, 
        is_active: bool
    ) -> None:
        """
        Рекурсивное обновление активности дочерних отделов
        """
        # Получаем все дочерние отделы
        children = await self.get_children(db, department_id=parent_id, include_inactive=True)
        
        for child in children:
            # Обновляем активность
            child.is_active = is_active
            db.add(child)
            
            # Рекурсивно обновляем потомков
            await self._update_children_activity(db, parent_id=child.id, is_active=is_active)
        
        await db.commit()

    async def move_department(
        self, 
        db: AsyncSession, 
        *, 
        department_id: int, 
        new_parent_id: Optional[int]
    ) -> Optional[Department]:
        """
        Перемещение отдела в иерархии (смена родительского отдела)
        """
        department = await self.get(db, id=department_id)
        if not department:
            return None
        
        # Проверка, не перемещаем ли отдел в своего потомка
        if new_parent_id is not None:
            descendants = await self.get_all_descendants(db, department_id=department_id)
            if any(d.id == new_parent_id for d in descendants):
                return None  # Нельзя переместить отдел в собственного потомка
        
        old_level = department.level
        
        # Определяем новый уровень
        new_level = 0  # По умолчанию для корневых отделов
        if new_parent_id is not None:
            new_parent = await self.get(db, id=new_parent_id)
            if new_parent:
                new_level = new_parent.level + 1
        
        # Обновляем родителя и уровень
        department.parent_id = new_parent_id
        department.level = new_level
        db.add(department)
        
        # Если уровень изменился, обновляем всех потомков
        level_diff = new_level - old_level
        if level_diff != 0:
            descendants = await self.get_all_descendants(db, department_id=department_id)
            for desc in descendants:
                desc.level = desc.level + level_diff
                db.add(desc)
        
        await db.commit()
        await db.refresh(department)
        
        return department


department = CRUDDepartment(Department) 