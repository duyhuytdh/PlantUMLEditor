@echo off
:: Stop PlantUML Editor Docker containers

echo Stopping PlantUML Editor...
docker-compose -f docker-compose.dev.yml down

echo.
echo PlantUML Editor stopped.
pause
