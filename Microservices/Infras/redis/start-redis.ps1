# Start Redis Only
Write-Host "Starting Redis..." -ForegroundColor Green

# Start Redis service
docker-compose up -d

Write-Host "Redis started successfully!" -ForegroundColor Green
Write-Host "Redis available at: localhost:6379" -ForegroundColor Cyan 