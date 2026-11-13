@echo off
title CivicFix Launcher
echo ===================================================
echo           Starting CivicFix Application            
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend Server on port 5000...
start "CivicFix Server (Port 5000)" cmd /k "cd server && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Client on port 5173...
start "CivicFix Client (Port 5173)" cmd /k "cd client && node ./node_modules/vite/bin/vite.js"

timeout /t 2 /nobreak >nul

echo.
echo ===================================================
echo CivicFix is running!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api/v1
echo ===================================================
start http://localhost:5173
