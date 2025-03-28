from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Body, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import os
from datetime import datetime
import base64

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings

router = APIRouter()


@router.post("/webhook", response_model=Dict[str, Any])
async def process_telegram_webhook(
    background_tasks: BackgroundTasks,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Обработка вебхука от Telegram бота.
    Получает данные анкеты сотрудника и создает запись в базе данных.
    """
    # Проверяем наличие всех необходимых полей в анкете
    required_fields = ["name", "position", "department", "organization_id"]
    for field in required_fields:
        if field not in data:
            return JSONResponse(
                status_code=400,
                content={"message": f"Отсутствует обязательное поле: {field}"}
            )
    
    # Проверяем наличие фотографии - она обязательна
    if "photo" not in data or not data["photo"]:
        return JSONResponse(
            status_code=400,
            content={"message": "Фотография сотрудника обязательна"}
        )
    
    # Сохраняем фотографию
    try:
        # Создаем директорию если не существует
        os.makedirs(os.path.join(settings.UPLOAD_DIR, "photos"), exist_ok=True)
        
        # Декодируем base64 фото
        photo_data = base64.b64decode(data["photo"])
        
        # Формируем имя файла с временной меткой
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_telegram_photo.jpg"
        photo_path = os.path.join("photos", filename)
        full_path = os.path.join(settings.UPLOAD_DIR, photo_path)
        
        # Записываем фото на диск
        with open(full_path, "wb") as f:
            f.write(photo_data)
        
        # Обновляем данные сотрудника
        data["photo_path"] = photo_path
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при сохранении фотографии: {str(e)}"}
        )
    
    # Обработка других документов, если они есть
    if "passport" in data and data["passport"]:
        try:
            os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok=True)
            passport_data = base64.b64decode(data["passport"])
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_telegram_passport.pdf"
            passport_path = os.path.join("documents", filename)
            full_path = os.path.join(settings.UPLOAD_DIR, passport_path)
            
            with open(full_path, "wb") as f:
                f.write(passport_data)
            
            data["passport_path"] = passport_path
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"message": f"Ошибка при сохранении паспорта: {str(e)}"}
            )
    
    if "work_contract" in data and data["work_contract"]:
        try:
            os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok=True)
            contract_data = base64.b64decode(data["work_contract"])
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_telegram_contract.pdf"
            contract_path = os.path.join("documents", filename)
            full_path = os.path.join(settings.UPLOAD_DIR, contract_path)
            
            with open(full_path, "wb") as f:
                f.write(contract_data)
            
            data["work_contract_path"] = contract_path
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"message": f"Ошибка при сохранении трудового договора: {str(e)}"}
            )
    
    # Удаляем бинарные данные из словаря
    if "photo" in data:
        del data["photo"]
    if "passport" in data:
        del data["passport"]
    if "work_contract" in data:
        del data["work_contract"]
    
    # Создаем сотрудника
    try:
        employee_in = schemas.EmployeeCreate(**data)
        employee = crud.employee.create(db=db, obj_in=employee_in)
        
        return {
            "success": True,
            "message": "Сотрудник успешно зарегистрирован",
            "employee_id": employee.id
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Ошибка при создании сотрудника: {str(e)}"}
        )


@router.post("/validate-token", response_model=Dict[str, Any])
def validate_telegram_bot_token(
    token: str = Body(..., embed=True),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Валидация токена Telegram бота.
    Используется для проверки подлинности запросов от бота.
    """
    # Здесь должна быть проверка токена на соответствие настроенному в системе
    # В упрощенном варианте просто сравниваем с захардкоженным значением
    expected_token = "your_telegram_bot_secret_token"  # В реальном приложении брать из настроек
    
    if token == expected_token:
        return {"valid": True, "message": "Токен действителен"}
    else:
        return {"valid": False, "message": "Недействительный токен"}


@router.get("/organizations", response_model=List[Dict[str, Any]])
def get_organizations_for_bot(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Получить список организаций для выбора в Telegram боте.
    """
    organizations = crud.organization.get_multi(db)
    
    # Преобразуем в простой список для бота
    result = []
    for org in organizations:
        result.append({
            "id": org.id,
            "name": org.name,
            "description": org.description or ""
        })
    
    return result 