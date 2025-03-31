import secrets
from typing import Any, Dict, List, Optional, Union
import os
from pydantic import AnyHttpUrl, EmailStr, HttpUrl, PostgresDsn, field_validator, ConfigDict
from pydantic_settings import BaseSettings
from urllib.parse import quote_plus


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    SERVER_NAME: str = "OFS Global"
    SERVER_HOST: AnyHttpUrl = "http://localhost:8000"
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000", \
    # "http://localhost:8080", "http://local.dockertoolbox.tiangolo.com"]'
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:8080"]

    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    PROJECT_NAME: str = "OFS Global"
    SENTRY_DSN: Optional[HttpUrl] = None

    @field_validator("SENTRY_DSN", mode='before')
    def sentry_dsn_can_be_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is None or len(str(v)) == 0:
            return None
        return v

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "QAZwsxr$t5"
    POSTGRES_DB: str = "ofs_db_new"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode='before')
    def assemble_db_connection(cls, v: Optional[str], info) -> str:
        if isinstance(v, str):
            return v

        # Формируем URL вручную для большего контроля
        values = info.data
        user = values.get("POSTGRES_USER", "")
        password = values.get("POSTGRES_PASSWORD", "")
        host = values.get("POSTGRES_SERVER", "localhost")
        db = values.get("POSTGRES_DB", "")

        # Собираем URL для асинхронного подключения без параметра client_encoding в URL
        # Настройка кодировки установлена через connect_args в session.py
        return f"postgresql+asyncpg://{user}:{password}@{host}/{db}"

    @property
    def SYNC_SQLALCHEMY_DATABASE_URI(self) -> str:
        """Возвращает URL для синхронного подключения к базе данных"""
        user = self.POSTGRES_USER
        password = quote_plus(self.POSTGRES_PASSWORD)
        host = self.POSTGRES_SERVER
        db = self.POSTGRES_DB
        # Убираем параметр client_encoding из URL, так как он может вызывать проблемы
        # в зависимости от используемого драйвера
        return f"postgresql://{user}:{password}@{host}/{db}"

    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None

    @field_validator("EMAILS_FROM_NAME", mode='before')
    def get_project_name(cls, v: Optional[str], info) -> str:
        if not v:
            return info.data["PROJECT_NAME"]
        return v

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    EMAIL_TEMPLATES_DIR: str = "/app/app/email-templates/build"
    EMAILS_ENABLED: bool = False

    @field_validator("EMAILS_ENABLED", mode='before')
    def get_emails_enabled(cls, v: bool, info) -> bool:
        values = info.data
        return bool(
            values.get("SMTP_HOST")
            and values.get("SMTP_PORT")
            and values.get("EMAILS_FROM_EMAIL")
        )

    EMAIL_TEST_USER: EmailStr = "test@example.com"  # type: ignore
    FIRST_SUPERUSER: EmailStr = "admin@ofs-global.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin"
    USERS_OPEN_REGISTRATION: bool = False
    
    # Директория для загрузки файлов
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")

    # SQLAlchemy settings
    SQLALCHEMY_ECHO: bool = False  # Enable SQL query logging for debugging
    
    # Database encoding settings
    DB_CHARSET: str = "utf8"
    DB_COLLATION: str = "utf8_general_ci"

    model_config = ConfigDict(case_sensitive=True)


settings = Settings() 