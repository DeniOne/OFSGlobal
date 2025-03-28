from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud, models, schemas
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Employee])
async def get_staff(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get a list of staff/employees."""
    employees = await crud.employee.get_multi(db, skip=skip, limit=limit)
    return employees

@router.post("/", response_model=schemas.Employee)
async def create_staff(
    *,
    db: AsyncSession = Depends(deps.get_db),
    staff_in: schemas.EmployeeCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Create new staff/employee."""
    employee = await crud.employee.create(db, obj_in=staff_in)
    return employee

@router.get("/{staff_id}", response_model=schemas.Employee)
async def get_staff_member(
    *,
    db: AsyncSession = Depends(deps.get_db),
    staff_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get staff/employee by ID."""
    employee = await crud.employee.get(db, id=staff_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{staff_id}", response_model=schemas.Employee)
async def update_staff(
    *,
    db: AsyncSession = Depends(deps.get_db),
    staff_id: int,
    staff_in: schemas.EmployeeUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a staff/employee."""
    employee = await crud.employee.get(db, id=staff_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee = await crud.employee.update(db, db_obj=employee, obj_in=staff_in)
    return employee

@router.delete("/{staff_id}", response_model=schemas.Employee)
async def delete_staff(
    *,
    db: AsyncSession = Depends(deps.get_db),
    staff_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a staff/employee."""
    employee = await crud.employee.get(db, id=staff_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee = await crud.employee.remove(db, id=staff_id)
    return employee 