@echo off
title Palabritas
cd /d "%~dp0"
echo.
echo   Starting Palabritas...  (keep this window open while you play, close it to stop)
echo.
if not exist node_modules call npm install
call npm run phone
pause
