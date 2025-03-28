@echo off
echo ========== ЗАПУСК БЭКЕНД-СЕРВЕРА ==========

REM Активируем виртуальное окружение
call venv\Scripts\activate.bat

REM Запускаем сервер
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level debug

pause 