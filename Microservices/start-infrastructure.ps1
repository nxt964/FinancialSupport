# Start All Infrastructure
Write-Host "Starting all infrastructure services..." -ForegroundColor Green

# Change to infrastructure directory and start all services
Set-Location "Shared/Infrastructure"
docker-compose up -d

Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "Infrastructure started successfully!" -ForegroundColor Green
Write-Host "Kafka UI available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Kafka broker: localhost:9092" -ForegroundColor Cyan
Write-Host "Zookeeper: localhost:2181" -ForegroundColor Cyan
Write-Host "Redis: localhost:6379" -ForegroundColor Cyan
Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host "Topics created automatically!" -ForegroundColor Green

# Return to original directory
Set-Location "../.." 