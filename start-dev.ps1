# CivicFix Application Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          Starting CivicFix Application            " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
Set-Location $root

Write-Host "`n[1/2] Starting Backend Server on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\server'; node server.js"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Frontend Client on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\client'; node ./node_modules/vite/bin/vite.js"

Start-Sleep -Seconds 2

Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "CivicFix is live!" -ForegroundColor Yellow
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "Backend API: http://localhost:5000/api/v1" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan

Start-Process "http://localhost:5173"
