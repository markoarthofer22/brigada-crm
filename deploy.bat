@echo off
setlocal ENABLEEXTENSIONS

:: Enable ANSI escape sequences on newer Windows terminals
:: (May not work on very old cmd versions)
for /f "tokens=2 delims=[]" %%i in ('ver') do set VERSION=%%i
if not "%VERSION%"=="" (
    echo %VERSION% | findstr /R "10\.">nul && goto :colorsEnabled
)
goto :noColors

:colorsEnabled
set GREEN=[32m
set RED=[31m
set YELLOW=[33m
set RESET=[0m
goto :main

:noColors
set GREEN=
set RED=
set YELLOW=
set RESET=
goto :main

:main
cls
echo %YELLOW%Adding all changes...%RESET%
git add -A
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR] Failed to add changes.%RESET%
    exit /b 1
)

echo %YELLOW%Committing changes...%RESET%
set /p MSG="Enter commit message: "
git commit -m "%MSG%"
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR] Commit failed. Maybe nothing to commit?%RESET%
    exit /b 1
)

echo %YELLOW%Pushing to origin...%RESET%
git push
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR] Push to origin failed.%RESET%
    exit /b 1
)

echo %YELLOW%Pushing to 'live' remote...%RESET%
git push live main
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR] Push to live failed.%RESET%
    exit /b 1
)

echo %GREEN%✅ All done! Code pushed successfully.%RESET%
exit /b 0
