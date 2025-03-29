from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Создаем асинхронный движок SQLAlchemy с явными настройками кодировки
engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    echo=settings.SQLALCHEMY_ECHO,
    connect_args={
        "client_encoding": "utf8",
        "options": "-c search_path=public -c client_encoding=utf8"
    }
)

# Создаем фабрику асинхронных сессий
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Функция-генератор для создания сессии базы данных
async def get_db() -> AsyncSession:
    """
    Зависимость для получения сессии базы данных.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 