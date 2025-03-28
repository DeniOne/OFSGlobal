@echo off
echo === Проверка Python-процессов ===
echo Время: %DATE% %TIME%

tasklist | findstr python

echo.
echo === Проверка завершена ===

echo === Проверка Python-процессов: %DATE% %TIME% === >> python_check.log
tasklist | findstr python >> python_check.log
echo ====================================== >> python_check.log 