from typing import List, Dict, Any, Optional, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import true

from app.crud.base import CRUDBase
from app.models.division import Division
from app.schemas.division import DivisionCreate, DivisionUpdate

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import joinedload


class CRUDDivision(CRUDBase[Division, DivisionCreate, DivisionUpdate]):
    """
    CRUD операции с отделами.
    """
    
    def get_by_name(self, db: Session, *, name: str, organization_id: int) -> Optional[Division]:
        """
        Получить отдел по названию и организации.
        """
        return db.query(Division).filter(
            Division.name == name,
            Division.organization_id == organization_id
        ).first()
    
    async def get_by_code(
        self, db: AsyncSession, *, code: str, organization_id: int
    ) -> Optional[Division]:
        """
        Получение отдела по коду в рамках указанной организации
        """
        result = await db.execute(
            select(Division)
            .where(
                and_(
                    Division.code == code,
                    Division.organization_id == organization_id
                )
            )
        )
        return result.scalars().first()
    
    def get_multi_by_organization(
        self, db: Session, *, organization_id: int, skip: int = 0, limit: int = 100,
        name: Optional[str] = None, code: Optional[str] = None, active: Optional[bool] = None,
        level: Optional[int] = None
    ) -> List[Division]:
        """
        Получить список отделов по организации с возможностью фильтрации.
        """
        query = db.query(self.model).filter(Division.organization_id == organization_id)
        
        if name:
            query = query.filter(Division.name.ilike(f"%{name}%"))
        
        if code:
            query = query.filter(Division.code.ilike(f"%{code}%"))
        
        if active is not None:
            query = query.filter(Division.is_active == active)
        
        if level is not None:
            query = query.filter(Division.level == level)
            
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
    ) -> List[Division]:
        """
        Получение отделов для указанной организации
        Если parent_id указан, возвращаются только дочерние отделы
        Если parent_id = None, возвращаются корневые отделы (без родителя)
        """
        filters = [Division.organization_id == organization_id]
        
        # Фильтрация по родительскому отделу
        filters.append(Division.parent_id == parent_id)
        
        # Фильтрация по активности
        if not include_inactive:
            filters.append(Division.is_active == True)
        
        result = await db.execute(
            select(Division)
            .where(and_(*filters))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    def get_children(self, db: Session, *, Division_id: int, active_only: bool = False) -> List[Division]:
        """
        Получить все дочерние отделы для указанного отдела.
        """
        query = db.query(self.model).filter(Division.parent_id == Division_id)
        
        if active_only:
            query = query.filter(Division.is_active == True)
            
        return query.all()
    
    async def get_children(
        self, 
        db: AsyncSession, 
        *, 
        Division_id: int,
        include_inactive: bool = False
    ) -> List[Division]:
        """
        Получение прямых дочерних отделов для указанного отдела
        """
        filters = [Division.parent_id == Division_id]
        
        if not include_inactive:
            filters.append(Division.is_active == True)
        
        result = await db.execute(
            select(Division)
            .where(and_(*filters))
        )
        return result.scalars().all()
    
    def get_root_Divisions(self, db: Session, *, organization_id: int) -> List[Division]:
        """
        Получить корневые отделы организации (без родительского отдела).
        """
        return db.query(self.model).filter(
            Division.organization_id == organization_id,
            Division.parent_id == None
        ).all()
    
    async def get_all_descendants(
        self, 
        db: AsyncSession, 
        *, 
        Division_id: int,
        include_inactive: bool = False
    ) -> List[Division]:
        """
        Получение всех потомков отдела (всех уровней иерархии)
        """
        # Получаем прямых потомков
        children = await self.get_children(db, Division_id=Division_id, include_inactive=include_inactive)
        
        descendants = list(children)  # Копируем список чтобы не менять его при проходе
        
        # Для каждого дочернего отдела получаем его потомков
        for child in children:
            child_descendants = await self.get_all_descendants(
                db, Division_id=child.id, include_inactive=include_inactive
            )
            descendants.extend(child_descendants)
        
        return descendants
    
    async def get_Division_tree(
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
        filters = [Division.organization_id == organization_id]
        if not include_inactive:
            filters.append(Division.is_active == True)
            
        result = await db.execute(
            select(Division)
            .where(and_(*filters))
            .order_by(Division.level)
        )
        all_Divisions = result.scalars().all()
        
        # Строим дерево отделов
        Divisions_by_id = {dept.id: dept for dept in all_Divisions}
        tree = []
        for dept in all_Divisions:
            # Устанавливаем дочерние отделы
            dept_dict = jsonable_encoder(dept)
            dept_dict["children"] = []
            
            # Если отдел без родителя, добавляем в корень дерева
            if dept.parent_id is None:
                tree.append(dept_dict)
            # Иначе добавляем как дочерний
            elif dept.parent_id in Divisions_by_id:
                parent = Divisions_by_id[dept.parent_id]
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
    ) -> Division:
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
        db_obj: Division,
        obj_in: Union[BaseModel, Dict[str, Any]]
    ) -> Division:
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
        children = await self.get_children(db, Division_id=parent_id, include_inactive=True)
        
        for child in children:
            # Обновляем активность
            child.is_active = is_active
            db.add(child)
            
            # Рекурсивно обновляем потомков
            await self._update_children_activity(db, parent_id=child.id, is_active=is_active)
        
        await db.commit()

    async def move_Division(
        self, 
        db: AsyncSession, 
        *, 
        Division_id: int, 
        new_parent_id: Optional[int]
    ) -> Optional[Division]:
        """
        Перемещение отдела в иерархии (смена родительского отдела)
        """
        Division = await self.get(db, id=Division_id)
        if not Division:
            return None
        
        # Проверка, не перемещаем ли отдел в своего потомка
        if new_parent_id is not None:
            descendants = await self.get_all_descendants(db, Division_id=Division_id)
            if any(d.id == new_parent_id for d in descendants):
                return None  # Нельзя переместить отдел в собственного потомка
        
        old_level = Division.level
        
        # Определяем новый уровень
        new_level = 0  # По умолчанию для корневых отделов
        if new_parent_id is not None:
            new_parent = await self.get(db, id=new_parent_id)
            if new_parent:
                new_level = new_parent.level + 1
        
        # Обновляем родителя и уровень
        Division.parent_id = new_parent_id
        Division.level = new_level
        db.add(Division)
        
        # Если уровень изменился, обновляем всех потомков
        level_diff = new_level - old_level
        if level_diff != 0:
            descendants = await self.get_all_descendants(db, Division_id=Division_id)
            for desc in descendants:
                desc.level = desc.level + level_diff
                db.add(desc)
        
        await db.commit()
        await db.refresh(Division)
        
        return Division


division = CRUDDivision(Division)
