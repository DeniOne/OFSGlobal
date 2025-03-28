from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Organization])
def read_organizations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Получить список организаций.
    """
    organizations = crud.organization.get_multi(db, skip=skip, limit=limit)
    return organizations

@router.post("/", response_model=schemas.Organization)
def create_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_in: schemas.OrganizationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Создать новую организацию.
    """
    organization = crud.organization.create(db, obj_in=organization_in)
    return organization

@router.get("/{organization_id}", response_model=schemas.Organization)
def read_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Получить организацию по ID.
    """
    organization = crud.organization.get(db, id=organization_id)
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Организация не найдена"
        )
    return organization 