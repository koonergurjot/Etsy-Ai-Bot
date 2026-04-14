@echo off
title Setup — Clone Etsy-Ai-Bot Repo
color 0B

echo ============================================================
echo   Setup: Clone github.com/koonergurjot/Etsy-Ai-Bot
echo ============================================================
echo.
echo This will clone your GitHub repo to a folder on your PC.
echo After cloning, point Cowork to that folder.
echo.

:: Check Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed.
    echo Download it from https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Ask where to clone
set /p CLONE_PATH="Where do you want to clone the repo? (e.g. C:\Projects\Etsy-Ai-Bot): "

if "%CLONE_PATH%"=="" (
    echo No path entered. Exiting.
    pause
    exit /b 1
)

:: Clone the repo
echo.
echo Cloning https://github.com/koonergurjot/Etsy-Ai-Bot ...
git clone https://github.com/koonergurjot/Etsy-Ai-Bot "%CLONE_PATH%"

if errorlevel 1 (
    echo.
    echo ERROR: Clone failed. Check the URL and your internet connection.
    pause
    exit /b 1
)

:: Copy auto_push.py and start_watcher.bat into the cloned folder
echo.
echo Copying auto-push tools into your cloned folder...
copy /Y "%~dp0auto_push.py" "%CLONE_PATH%\auto_push.py" >nul
copy /Y "%~dp0start_watcher.bat" "%CLONE_PATH%\start_watcher.bat" >nul

echo.
echo ============================================================
echo   SUCCESS! Your repo is cloned at:
echo   %CLONE_PATH%
echo ============================================================
echo.
echo NEXT STEPS:
echo   1. In Cowork, click "Change Folder" and select:
echo      %CLONE_PATH%
echo   2. Double-click start_watcher.bat inside that folder
echo      to start auto-pushing changes to GitHub.
echo   3. Make sure GitHub Pages is enabled in your repo settings.
echo      (Settings → Pages → Branch: main or gh-pages)
echo.
pause
