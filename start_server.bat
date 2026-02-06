@echo off
echo Setting up environment variables...
set "PATH=C:\Program Files\nodejs;%PATH%"

echo Starting Development Server...
npm run dev
pause
