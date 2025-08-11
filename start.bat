@echo off
:: PlantUML Editor - Quick Start Script
:: This script builds the Java server locally and starts all Docker containers

echo =======================================
echo  PlantUML Editor - Quick Start
echo =======================================

echo [1/3] Building Java server locally...
cd java-plantuml-server
call mvn clean package -DskipTests -q
if %ERRORLEVEL% neq 0 (
    echo ERROR: Maven build failed!
    echo Please ensure Maven and Java 11+ are installed.
    pause
    exit /b 1
)
echo Java server built successfully!

echo [2/3] Starting Docker containers...
cd ..
docker-compose -f docker-compose.dev.yml up -d
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker startup failed!
    echo Please ensure Docker is running.
    pause
    exit /b 1
)

echo [3/3] Checking container status...
timeout /t 3 /nobreak >nul
docker-compose -f docker-compose.dev.yml ps

echo.
echo =======================================
echo  PlantUML Editor is Ready!
echo =======================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8090
echo Health:   http://localhost:8090/api/plantuml/health
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo To stop the application, run: stop.bat
echo.