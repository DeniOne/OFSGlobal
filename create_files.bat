@echo off
cd D:\OFS_Global\ofs_project\ofs_new\backend\app\api\api_v1\endpoints

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
echo async def get_employees(* >> employees.py
echo     db: AsyncSession = Depends(deps.get_db), >> employees.py
echo     skip: int = 0, >> employees.py
echo     limit: int = 100, >> employees.py
echo     current_user: User = Depends(deps.get_current_active_user), >> employees.py
echo ) -^> Any: >> employees.py
echo     """Get a list of employees.""" >> employees.py
echo     employees = await crud.employee.get_multi(db, skip=skip, limit=limit) >> employees.py
echo     return employees >> employees.py

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
echo async def get_departments(* >> departments.py
echo     db: AsyncSession = Depends(deps.get_db), >> departments.py
echo     skip: int = 0, >> departments.py
echo     limit: int = 100, >> departments.py
echo     current_user: User = Depends(deps.get_current_active_user), >> departments.py
echo ) -^> Any: >> departments.py
echo     """Get a list of departments.""" >> departments.py
echo     departments = await crud.department.get_multi(db, skip=skip, limit=limit) >> departments.py
echo     return departments >> departments.py

cd D:\OFS_Global\ofs_project\ofs_new\backend\app\api\api_v1

echo from fastapi import APIRouter > api.py
echo. >> api.py
echo from app.api.api_v1.endpoints import ( >> api.py
echo     items, login, users, utils, organizations, >> api.py
echo     departments, employees, >> api.py
echo     functional_relations, telegram_bot, positions >> api.py
echo ) >> api.py
echo. >> api.py
echo api_router = APIRouter() >> api.py
echo api_router.include_router(login.router, tags=["login"]) >> api.py
echo api_router.include_router(users.router, prefix="/users", tags=["users"]) >> api.py
echo api_router.include_router(utils.router, prefix="/utils", tags=["utils"]) >> api.py
echo api_router.include_router(items.router, prefix="/items", tags=["items"]) >> api.py
echo api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"]) >> api.py
echo. >> api.py
echo api_router.include_router(departments.router, prefix="/departments", tags=["departments"]) >> api.py
echo api_router.include_router(employees.router, prefix="/employees", tags=["employees"]) >> api.py
echo api_router.include_router( >> api.py
echo     functional_relations.router, >> api.py
echo     prefix="/functional-relations", >> api.py
echo     tags=["functional-relations"] >> api.py
echo ) >> api.py
echo api_router.include_router( >> api.py
echo     telegram_bot.router, >> api.py
echo     prefix="/telegram-bot", >> api.py
echo     tags=["telegram-bot"] >> api.py
echo ) >> api.py
echo api_router.include_router(positions.router, prefix="/positions", tags=["positions"]) >> api.py 