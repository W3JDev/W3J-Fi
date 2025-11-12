@echo off
echo ========================================
echo    W3JFi - Lottery & Polling System
echo ========================================
echo.
echo Starting both servers...
echo.

REM Start backend in new window
start "W3JFi Backend" cmd /k "cd backend && npm start"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "W3JFi Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Keep those windows open!
echo You can close this window now.
echo.
pause
