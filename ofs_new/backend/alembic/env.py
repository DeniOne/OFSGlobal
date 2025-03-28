import asyncio
from logging.config import fileConfig
import os
from dotenv import load_dotenv
import psycopg2
from urllib.parse import quote_plus

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy import create_engine

from alembic import context

from app.core.config import settings
from app.db.base_class import Base
from app.models import *  # Импортируем все модели

# Загружаем переменные окружения
load_dotenv()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def get_connection_params():
    """Получаем параметры подключения к базе данных"""
    password = os.getenv("POSTGRES_PASSWORD", "password")
    params = {
        'host': os.getenv("POSTGRES_SERVER", "localhost"),
        'user': os.getenv("POSTGRES_USER", "postgres"),
        'password': password,
        'database': os.getenv("POSTGRES_DB", "ofs_db"),
        'port': os.getenv("POSTGRES_PORT", "5432")
    }
    print("Database connection parameters:", params)
    return params

def get_url():
    """Получаем URL для подключения к базе данных с URL-кодированным паролем"""
    params = get_connection_params()
    return f"postgresql://{params['user']}:{quote_plus(params['password'])}@{params['host']}:{params['port']}/{params['database']}"

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    params = get_connection_params()
    
    # Создаем подключение через psycopg2
    conn = psycopg2.connect(**params)
    
    # Создаем движок SQLAlchemy с существующим подключением
    engine = create_engine(
        'postgresql://',
        creator=lambda: conn,
        poolclass=pool.NullPool
    )

    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
