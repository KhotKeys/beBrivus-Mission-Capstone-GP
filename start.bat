@echo off
echo ========================================
echo beBrivus Quick Start Script
echo ========================================
echo.

echo [1/5] Checking prerequisites...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [2/5] Setting up backend...
cd backend
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
echo.

echo [3/5] Setting up frontend...
cd ..\frontend
call npm install
echo.

echo [4/5] Starting services...
echo Starting backend server...
start cmd /k "cd ..\backend && .venv\Scripts\activate && python manage.py runserver 0.0.0.0:8001"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start cmd /k "cd ..\frontend && npm run dev"

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo Services running:
echo - Backend: http://localhost:8001
echo - Frontend: http://localhost:5173
echo - Admin: http://localhost:8001/admin
echo ========================================
echo.
echo Press any key to stop all services...
pause >nul
taskkill /F /FI "WindowTitle eq *runserver*"
taskkill /F /FI "WindowTitle eq *npm*"
