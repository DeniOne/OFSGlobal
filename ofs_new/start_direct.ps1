# Простой скрипт для прямого запуска серверов

# Пути к директориям
$backendPath = "D:\OFS_Global\ofs_project\ofs_new\backend"
$frontendPath = "D:\OFS_Global\ofs_project\ofs_new\frontend"
$venvPath = "D:\OFS_Global\ofs_project\new_venv"

# Активируем виртуальное окружение
& "$venvPath\Scripts\Activate.ps1"

# Запускаем бэкенд
Write-Host "Запуск бэкенд-сервера..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command ""cd '$backendPath'; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload""" -WindowStyle Normal

# Ждем немного
Start-Sleep -Seconds 3

# Запускаем фронтенд
Write-Host "Запуск фронтенд-сервера..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command ""cd '$frontendPath'; npm run dev""" -WindowStyle Normal

Write-Host "Серверы запущены!" -ForegroundColor Green
Write-Host "Бэкенд: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Фронтенд: http://localhost:3000" -ForegroundColor Yellow 