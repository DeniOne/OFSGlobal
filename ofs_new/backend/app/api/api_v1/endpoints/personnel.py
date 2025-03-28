from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud, models, schemas
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Employee])
async def get_personnel(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get a list of personnel/employees."""
    employees = await crud.employee.get_multi(db, skip=skip, limit=limit)
    return employees

@router.post("/", response_model=schemas.Employee)
async def create_personnel(
    *,
    db: AsyncSession = Depends(deps.get_db),
    personnel_in: schemas.EmployeeCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Create new personnel/employee."""
    employee = await crud.employee.create(db, obj_in=personnel_in)
    return employee

@router.get("/{personnel_id}", response_model=schemas.Employee)
async def get_personnel_member(
    *,
    db: AsyncSession = Depends(deps.get_db),
    personnel_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get personnel/employee by ID."""
    employee = await crud.employee.get(db, id=personnel_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{personnel_id}", response_model=schemas.Employee)
async def update_personnel(
    *,
    db: AsyncSession = Depends(deps.get_db),
    personnel_id: int,
    personnel_in: schemas.EmployeeUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a personnel/employee."""
    employee = await crud.employee.get(db, id=personnel_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee = await crud.employee.update(db, db_obj=employee, obj_in=personnel_in)
    return employee

@router.delete("/{personnel_id}", response_model=schemas.Employee)
async def delete_personnel(
    *,
    db: AsyncSession = Depends(deps.get_db),
    personnel_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a personnel/employee."""
    employee = await crud.employee.get(db, id=personnel_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee = await crud.employee.remove(db, id=personnel_id)
    return employee 