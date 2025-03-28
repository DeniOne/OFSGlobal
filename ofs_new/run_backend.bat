@echo off
echo ========== ЗАПУСК БЭКЕНД-СЕРВЕРА ==========
cd /d D:\OFS_Global\ofs_project\new_venv\Scripts
call activate.bat
cd /d D:\OFS_Global\ofs_project\ofs_new\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level debug
pause 