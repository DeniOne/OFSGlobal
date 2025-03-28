@echo off
echo ========== ЗАПУСК ПРОЕКТА ==========

REM Запускаем фронтенд
start "Frontend" cmd /k "cd frontend && npm run dev"

REM Запускаем бэкенд
start "Backend" cmd /k "cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level debug"

echo Проект запущен!
echo Фронтенд: http://localhost:3000
echo Бэкенд: http://localhost:8000
echo Документация API: http://localhost:8000/docs 