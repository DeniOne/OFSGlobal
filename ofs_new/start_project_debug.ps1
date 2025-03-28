# Скрипт для запуска проекта OFS Global с расширенными проверками
# Устанавливает все зависимости и запускает фронтенд и бэкенд

# Настраиваем кодировку консоли для корректного отображения кириллицы
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Функция для проверки занятости портов
function Test-PortInUse {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connections
}

# Функция для проверки и установки пакетов Python
function Install-PythonPackages {
    Write-Host "Проверка и установка необходимых пакетов Python..." -ForegroundColor Cyan

    # Список необходимых пакетов
    $packages = @("fastapi", "uvicorn", "sqlalchemy", "pydantic", "python-jose", "passlib", "python-multipart", "email-validator", "alembic", "python-dotenv")

    foreach ($package in $packages) {
        Write-Host "Проверка пакета $package..." -ForegroundColor Gray
        try {
            # Проверяем, установлен ли пакет
            $installed = pip list | Select-String -Pattern "^$package "
            
            if (-not $installed) {
                Write-Host "Установка пакета $package..." -ForegroundColor Yellow
                pip install $package
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "Ошибка при установке пакета $package" -ForegroundColor Red
                }
            } else {
                Write-Host "Пакет $package уже установлен." -ForegroundColor Green
            }
        } catch {
            Write-Host "Ошибка при проверке/установке пакета $package : $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host "Все необходимые пакеты Python установлены!" -ForegroundColor Green
}

# Основная функция запуска
function Start-OFSProject {
    # Используем абсолютные пути для надежности
    $projectRoot = "D:\OFS_Global\ofs_project\ofs_new"
    $backendPath = "$projectRoot\backend"
    $frontendPath = "$projectRoot\frontend"
    
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Запуск проекта OFS Global в режиме отладки" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    
    # Проверка портов
    Write-Host "Проверка занятости портов..." -ForegroundColor Cyan
    if (Test-PortInUse -Port 8000) {
        Write-Host "ВНИМАНИЕ: Порт 8000 уже используется другим процессом!" -ForegroundColor Red
        Write-Host "Попытка освободить порт..." -ForegroundColor Yellow
        try {
            $process = Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "Процесс остановлен." -ForegroundColor Green
        } catch {
            Write-Host "Не удалось остановить процесс: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if (Test-PortInUse -Port 3000) {
        Write-Host "ВНИМАНИЕ: Порт 3000 уже используется другим процессом!" -ForegroundColor Red
        Write-Host "Попытка освободить порт..." -ForegroundColor Yellow
        try {
            $process = Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "Процесс остановлен." -ForegroundColor Green
        } catch {
            Write-Host "Не удалось остановить процесс: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Переходим в корневую директорию проекта
    try {
        Set-Location -Path $projectRoot
        Write-Host "Текущая директория: $projectRoot" -ForegroundColor Cyan
    } catch {
        Write-Host "Ошибка при переходе в директорию проекта: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    
    # Активируем виртуальное окружение, если оно существует
    $venvPath = "D:\OFS_Global\ofs_project\new_venv"
    if (Test-Path -Path "$venvPath\Scripts\Activate.ps1") {
        Write-Host "Активируем виртуальное окружение Python..." -ForegroundColor Cyan
        try {
            & "$venvPath\Scripts\Activate.ps1"
        } catch {
            Write-Host "Ошибка при активации виртуального окружения: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Виртуальное окружение не найдено, используем системный Python." -ForegroundColor Yellow
    }
    
    # Устанавливаем пакеты Python
    Install-PythonPackages
    
    # Проверяем наличие директорий backend и frontend
    if (-not (Test-Path -Path $backendPath)) {
        Write-Host "Ошибка: Директория backend не найдена по пути $backendPath" -ForegroundColor Red
        return
    } else {
        Write-Host "Директория backend найдена: $backendPath" -ForegroundColor Green
    }
    
    if (-not (Test-Path -Path $frontendPath)) {
        Write-Host "Ошибка: Директория frontend не найдена по пути $frontendPath" -ForegroundColor Red
        return
    } else {
        Write-Host "Директория frontend найдена: $frontendPath" -ForegroundColor Green
    }
    
    # Проверка наличия main.py в backend
    if (-not (Test-Path -Path "$backendPath\app\main.py")) {
        Write-Host "Ошибка: Файл main.py не найден в $backendPath\app\" -ForegroundColor Red
        return
    } else {
        Write-Host "Файл main.py найден: $backendPath\app\main.py" -ForegroundColor Green
    }
    
    # Проверка package.json во frontend
    if (-not (Test-Path -Path "$frontendPath\package.json")) {
        Write-Host "Ошибка: Файл package.json не найден в $frontendPath\" -ForegroundColor Red
        return
    } else {
        Write-Host "Файл package.json найден: $frontendPath\package.json" -ForegroundColor Green
    }
    
    # Проверяем, запущены ли уже процессы на портах
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    $port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

    if ($port3000) {
        Write-Host "Порт 3000 уже занят. Возможно, фронтенд уже запущен." -ForegroundColor Yellow
    }
    if ($port8000) {
        Write-Host "Порт 8000 уже занят. Возможно, бэкенд уже запущен." -ForegroundColor Yellow
    }
    
    # Проверяем и активируем виртуальное окружение для бэкенда
    if (-not (Test-Path "$backendPath\venv")) {
        Write-Host "Настраиваем виртуальное окружение для бэкенда..." -ForegroundColor Cyan
        Push-Location $backendPath
        python -m venv venv
        .\venv\Scripts\activate
        pip install -r requirements.txt
        Pop-Location
    }
    
    # Запускаем фронтенд
    Write-Host "Запускаем фронтенд..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
    
    # Запускаем бэкенд
    Write-Host "Запускаем бэкенд..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\venv\Scripts\activate; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level debug"
    
    Write-Host "Проект запущен!" -ForegroundColor Green
    Write-Host "Фронтенд доступен по адресу: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Бэкенд доступен по адресу: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Документация API: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "Для завершения работы закройте окна терминалов" -ForegroundColor Yellow
    
    # Ждем, пока пользователь не закроет скрипт
    try {
        # Держим скрипт запущенным и периодически проверяем процессы
        while ($true) { 
            Start-Sleep -Seconds 10
            
            # Проверяем состояние процессов
            if ($null -ne $port8000 -and -not $port8000) {
                Write-Host "ВНИМАНИЕ: Процесс бэкенда завершился!" -ForegroundColor Red
            }
            
            if ($null -ne $port3000 -and -not $port3000) {
                Write-Host "ВНИМАНИЕ: Процесс фронтенда завершился!" -ForegroundColor Red
            }
        }
    } finally {
        # При выходе останавливаем процессы
        if ($null -ne $port8000 -and -not $port8000) {
            Write-Host "Остановка процесса бэкенда..." -ForegroundColor Yellow
            $process = Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        }
        if ($null -ne $port3000 -and -not $port3000) {
            Write-Host "Остановка процесса фронтенда..." -ForegroundColor Yellow
            $process = Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        }
    }
}

# Запускаем проект
Start-OFSProject 