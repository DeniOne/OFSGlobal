# Структура проекта OFS Global

## Общая структура

```
ofs_new/               # Корневая директория проекта
│
├── backend/           # Бэкенд приложение
│   ├── app/           # Основной код приложения
│   │   ├── api/       # API эндпоинты
│   │   ├── core/      # Ядро приложения (конфигурация, безопасность)
│   │   ├── crud/      # Операции CRUD
│   │   ├── db/        # Настройки базы данных
│   │   ├── models/    # Модели базы данных
│   │   ├── routers/   # Маршрутизаторы FastAPI
│   │   ├── schemas/   # Pydantic схемы
│   │   ├── services/  # Бизнес-логика
│   │   └── main.py    # Точка входа в приложение
│   │
│   ├── config/        # Конфигурационные файлы
│   ├── scripts/       # Скрипты для работы с проектом
│   ├── tests/         # Тесты
│   └── requirements.txt # Зависимости Python
│
├── frontend/          # Фронтенд приложение
│   ├── public/        # Статические файлы
│   ├── src/           # Исходный код React/TypeScript
│   ├── node_modules/  # Зависимости JavaScript (генерируется автоматически)
│   ├── package.json   # Зависимости и скрипты NPM
│   └── ...            # Другие файлы конфигурации
│
├── telegram_bot/      # Бот для Telegram
│
├── docs/              # Документация
│
├── deployment/        # Файлы для развертывания
│
├── start.bat          # Скрипт запуска для Windows
└── start_project.ps1  # PowerShell скрипт запуска
```

## Запуск проекта

Для запуска проекта используйте скрипт `start.bat` в корне директории `ofs_new`:

```
cd path\to\ofs_new
start.bat
```

Это запустит:
- Бэкенд (FastAPI) на порту 8000
- Фронтенд (React) на порту 3000

## Технологический стек

### Бэкенд
- Python
- FastAPI
- SQLAlchemy
- Uvicorn
- Pydantic

### Фронтенд
- React
- TypeScript
- Vite
- NPM

## Дополнительная информация

Структура проекта следует принципам модульности и разделения ответственности. Бэкенд построен с использованием архитектуры, основанной на доменах, с чётким разделением между моделями, схемами и бизнес-логикой. 