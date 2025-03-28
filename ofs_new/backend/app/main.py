from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    """
    При запуске приложения создаем директории для загрузки файлов
    """
    # Создаем основную директорию для загрузок
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Создаем поддиректории для различных типов файлов
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "photos"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok=True)


@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в API системы управления организационной структурой OFS Global"} 