@echo off
title Setting up Etsy-Ai-Bot — Please Wait...
color 0A
setlocal enabledelayedexpansion

echo.
echo  =====================================================
echo   Etsy-Ai-Bot Full Setup
echo   github.com/koonergurjot/Etsy-Ai-Bot
echo  =====================================================
echo.

:: ── 1. Check Git ──────────────────────────────────────────────────────────────
git --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  ERROR: Git is not installed.
    echo  Download it from: https://git-scm.com/download/win
    echo  Then re-run this file.
    pause & exit /b 1
)
echo  [1/7] Git found. OK

:: ── 2. Check Python ───────────────────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  ERROR: Python is not installed.
    echo  Download it from: https://python.org/downloads
    echo  (Check "Add Python to PATH" during install!)
    pause & exit /b 1
)
echo  [2/7] Python found. OK

:: ── 3. Clone the repo ─────────────────────────────────────────────────────────
set DEST=C:\Projects\Etsy-Ai-Bot

if exist "%DEST%\.git" (
    echo  [3/7] Repo already cloned at %DEST% — skipping clone.
) else (
    echo  [3/7] Cloning repo to %DEST% ...
    git clone https://github.com/koonergurjot/Etsy-Ai-Bot "%DEST%"
    if errorlevel 1 (
        color 0C
        echo  ERROR: Clone failed. Check your internet or GitHub credentials.
        pause & exit /b 1
    )
    echo       Cloned OK!
)

:: ── 4. Copy tools into the cloned folder ─────────────────────────────────────
echo  [4/7] Copying auto-push tools and GitHub Actions workflow...

:: Copy watcher tools
copy /Y "%~dp0auto_push.py"       "%DEST%\auto_push.py"       >nul
copy /Y "%~dp0start_watcher.bat"  "%DEST%\start_watcher.bat"  >nul

:: Copy vite.config.ts fix (adds GitHub Pages base path)
copy /Y "%~dp0vite.config.ts"     "%DEST%\vite.config.ts"     >nul

:: Copy GitHub Actions workflow
if not exist "%DEST%\.github\workflows" mkdir "%DEST%\.github\workflows"
copy /Y "%~dp0.github\workflows\deploy.yml" "%DEST%\.github\workflows\deploy.yml" >nul

echo       Files copied OK!

:: ── 5. Stage & push the new files ────────────────────────────────────────────
echo  [5/7] Committing and pushing setup files to GitHub...
cd /d "%DEST%"
git add auto_push.py start_watcher.bat vite.config.ts .github\workflows\deploy.yml
git commit -m "Add auto-push watcher, GitHub Actions deploy workflow, and GitHub Pages vite fix"
git push
if errorlevel 1 (
    color 0E
    echo.
    echo  WARN: Push failed. You may need to enter your GitHub credentials.
    echo  Run this in the cloned folder once you're authenticated:
    echo    cd %DEST%
    echo    git push
    echo.
) else (
    echo       Pushed to GitHub! GitHub Actions will now build your site.
)

:: ── 6. Install watchdog ───────────────────────────────────────────────────────
echo  [6/7] Installing Python watchdog library...
pip install watchdog --quiet
echo       watchdog ready.

:: ── 7. Open GitHub settings in browser ───────────────────────────────────────
echo  [7/7] Opening GitHub Pages settings in your browser...
start "" "https://github.com/koonergurjot/Etsy-Ai-Bot/settings/pages"
echo       Set Branch to "gh-pages" and click Save.

:: ── Done ─────────────────────────────────────────────────────────────────────
echo.
echo  =====================================================
echo   SETUP COMPLETE!
echo  =====================================================
echo.
echo  Your repo is at: %DEST%
echo  GitHub Actions is building your site now.
echo  Once GitHub Pages is enabled your site will be at:
echo    https://koonergurjot.github.io/Etsy-Ai-Bot/
echo.
echo  LAST STEP: Start the auto-push watcher so future
echo  edits (from Claude or your local LLM) auto-push:
echo.
echo    Double-click start_watcher.bat in %DEST%
echo.
echo  Then in Cowork, switch your folder to:
echo    %DEST%
echo.
pause

:: Ask if they want to launch the watcher now
set /p LAUNCH="Start the file watcher now? (y/n): "
if /i "%LAUNCH%"=="y" (
    start "Auto-Push Watcher" cmd /k "cd /d %DEST% && python auto_push.py %DEST%"
    echo  Watcher launched in a new window. Keep it running!
)

echo.
echo  All done. Enjoy!
pause
