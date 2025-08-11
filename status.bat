@echo off
:: Check PlantUML Editor status

echo =======================================
echo  PlantUML Editor - Status Check
echo =======================================

echo Checking Docker containers...
docker-compose -f docker-compose.dev.yml ps

echo.
echo Checking if services are accessible...

echo Testing Frontend (localhost:5173)...
curl -s -o nul -w "%%{http_code}" http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ Frontend is accessible
) else (
    echo ✗ Frontend is not accessible
)

echo Testing Backend (localhost:8090)...
curl -s -o nul -w "%%{http_code}" http://localhost:8090/api/plantuml/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ Backend is accessible
) else (
    echo ✗ Backend is not accessible
)

echo.
echo =======================================
echo  Quick Links
echo =======================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8090
echo Health:   http://localhost:8090/api/plantuml/health
echo.
pause
