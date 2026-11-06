@echo off
setlocal
cd /d "%~dp0"
if exist "releases\desktop\桂庭拾光-Windows-一键启动-1.0.0.exe" (
  start "" "releases\desktop\桂庭拾光-Windows-一键启动-1.0.0.exe"
  exit /b
)
if exist "dist\index.html" (
  start "" /min cmd /c "npm run preview -- --host 127.0.0.1 --port 4173 >nul 2>&1"
  timeout /t 2 /nobreak >nul
  start "" "http://127.0.0.1:4173"
  exit /b
)
echo Please run npm install and npm run build first.
pause
