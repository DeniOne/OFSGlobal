@echo off
echo === Проверка Python-процессов ===
echo Время: %DATE% %TIME%
echo.

tasklist /FI "IMAGENAME eq python.exe" /V /FO LIST

echo.
echo === Проверка завершена ===

REM Добавляем информацию в лог
echo === Проверка Python-процессов: %DATE% %TIME% === >> python_processes.log
tasklist /FI "IMAGENAME eq python.exe" /V /FO TABLE >> python_processes.log
echo ====================================== >> python_processes.log 