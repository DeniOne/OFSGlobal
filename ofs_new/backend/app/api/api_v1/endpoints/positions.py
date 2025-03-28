from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_position
from app.schemas.position import PositionCreate, PositionUpdate, Position

router = APIRouter()


@router.get("/", response_model=List[Position])
def get_positions(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    name: Optional[str] = Query(None, description="Фильтр по названию должности"),
    active: Optional[bool] = Query(None, description="Фильтр по активности")
) -> List[Position]:
    """
    Получить список должностей с возможностью фильтрации.
    """
    positions = crud_position.get_multi(
        db, skip=skip, limit=limit, name=name, active=active
    )
    return positions


@router.post("/", response_model=Position)
def create_position(
    *,
    db: Session = Depends(deps.get_db),
    position_in: PositionCreate,
) -> Position:
    """
    Создать новую должность.
    """
    position = crud_position.get_by_name(db, name=position_in.name)
    if position:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Должность с таким названием уже существует."
        )
    position = crud_position.create(db=db, obj_in=position_in)
    return position


@router.get("/{position_id}", response_model=Position)
def get_position(
    *,
    db: Session = Depends(deps.get_db),
    position_id: int,
) -> Position:
    """
    Получить конкретную должность по ID.
    """
    position = crud_position.get(db=db, id=position_id)
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Должность не найдена."
        )
    return position


@router.put("/{position_id}", response_model=Position)
def update_position(
    *,
    db: Session = Depends(deps.get_db),
    position_id: int,
    position_in: PositionUpdate,
) -> Position:
    """
    Обновить должность.
    """
    position = crud_position.get(db=db, id=position_id)
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Должность не найдена."
        )
    # Проверка на уникальность имени при изменении
    if position_in.name and position_in.name != position.name:
        existing = crud_position.get_by_name(db, name=position_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Должность с таким названием уже существует."
            )
    position = crud_position.update(db=db, db_obj=position, obj_in=position_in)
    return position


@router.delete("/{position_id}", response_model=Position)
def delete_position(
    *,
    db: Session = Depends(deps.get_db),
    position_id: int,
) -> Position:
    """
    Удалить должность.
    """
    position = crud_position.get(db=db, id=position_id)
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Должность не найдена."
        )
    position = crud_position.remove(db=db, id=position_id)
    return position 