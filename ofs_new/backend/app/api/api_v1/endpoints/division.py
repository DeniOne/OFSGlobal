from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud, models, schemas
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Department])
async def get_divisions(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get a list of divisions/departments."""
    departments = await crud.division.get_multi(db, skip=skip, limit=limit)
    return departments

@router.post("/", response_model=schemas.Department)
async def create_division(
    *,
    db: AsyncSession = Depends(deps.get_db),
    division_in: schemas.DepartmentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Create new division."""
    division = await crud.division.create(db, obj_in=division_in)
    return division

@router.get("/{division_id}", response_model=schemas.Department)
async def get_division(
    *,
    db: AsyncSession = Depends(deps.get_db),
    division_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get division by ID."""
    division = await crud.division.get(db, id=division_id)
    if not division:
        raise HTTPException(status_code=404, detail="Division not found")
    return division

@router.put("/{division_id}", response_model=schemas.Department)
async def update_division(
    *,
    db: AsyncSession = Depends(deps.get_db),
    division_id: int,
    division_in: schemas.DepartmentUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a division."""
    division = await crud.division.get(db, id=division_id)
    if not division:
        raise HTTPException(status_code=404, detail="Division not found")
    division = await crud.division.update(db, db_obj=division, obj_in=division_in)
    return division

@router.delete("/{division_id}", response_model=schemas.Department)
async def delete_division(
    *,
    db: AsyncSession = Depends(deps.get_db),
    division_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a division."""
    division = await crud.division.get(db, id=division_id)
    if not division:
        raise HTTPException(status_code=404, detail="Division not found")
    division = await crud.division.remove(db, id=division_id)
    return division 