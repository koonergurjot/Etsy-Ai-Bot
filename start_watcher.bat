@echo off
title Auto-Push Watcher — Etsy-Ai-Bot
color 0A

echo ============================================================
echo   Auto-Push Watcher for github.com/koonergurjot/Etsy-Ai-Bot
echo ============================================================
echo.

:: Check Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Download it from https://python.org/downloads
    pause
    exit /b 1
)

:: Install watchdog if not already installed
echo Checking dependencies...
python -c "import watchdog" >nul 2>&1
if errorlevel 1 (
    echo Installing watchdog...
    pip install watchdog --quiet
)

echo.
echo Starting watcher in THIS folder...
echo Any file changes will be auto-committed and pushed to GitHub.
echo Press Ctrl+C to stop.
echo.

:: Run the watcher from the same folder as this .bat file
python "%~dp0auto_push.py" "%~dp0"

pause
