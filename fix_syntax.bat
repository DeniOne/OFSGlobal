@echo off
cd D:\OFS_Global\ofs_project\ofs_new\backend\app\api\api_v1\endpoints

echo from typing import Any, List, Optional > departments.py
echo from fastapi import APIRouter, Depends, HTTPException >> departments.py
echo from sqlalchemy.ext.asyncio import AsyncSession >> departments.py
echo from app import crud, models, schemas >> departments.py
echo from app.api import deps >> departments.py
echo from app.models.user import User >> departments.py
echo. >> departments.py
echo router = APIRouter() >> departments.py
echo. >> departments.py
echo @router.get("/", response_model=List[schemas.Department]) >> departments.py
echo async def get_departments( >> departments.py
echo     db: AsyncSession = Depends(deps.get_db), >> departments.py
echo     skip: int = 0, >> departments.py
echo     limit: int = 100, >> departments.py
echo     current_user: User = Depends(deps.get_current_active_user), >> departments.py
echo ) -^> Any: >> departments.py
echo     """Get a list of departments.""" >> departments.py
echo     departments = await crud.department.get_multi(db, skip=skip, limit=limit) >> departments.py
echo     return departments >> departments.py

echo from typing import Any, List, Optional > employees.py
echo from fastapi import APIRouter, Depends, HTTPException >> employees.py
echo from sqlalchemy.ext.asyncio import AsyncSession >> employees.py
echo from app import crud, models, schemas >> employees.py
echo from app.api import deps >> employees.py
echo from app.models.user import User >> employees.py
echo. >> employees.py
echo router = APIRouter() >> employees.py
echo. >> employees.py
echo @router.get("/", response_model=List[schemas.Employee]) >> employees.py
echo async def get_employees( >> employees.py
echo     db: AsyncSession = Depends(deps.get_db), >> employees.py
echo     skip: int = 0, >> employees.py
echo     limit: int = 100, >> employees.py
echo     current_user: User = Depends(deps.get_current_active_user), >> employees.py
echo ) -^> Any: >> employees.py
echo     """Get a list of employees.""" >> employees.py
echo     employees = await crud.employee.get_multi(db, skip=skip, limit=limit) >> employees.py
echo     return employees >> employees.py 