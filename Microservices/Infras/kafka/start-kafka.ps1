# Start Kafka Infrastructure Only
Write-Host "Starting Kafka infrastructure..." -ForegroundColor Green

# Start Kafka services
docker-compose up -d

Write-Host "Waiting for Kafka to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Kafka infrastructure started successfully!" -ForegroundColor Green
Write-Host "Kafka UI available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Kafka broker: localhost:9092" -ForegroundColor Cyan
Write-Host "Zookeeper: localhost:2181" -ForegroundColor Cyan 