# Start PostgreSQL Only
Write-Host "Starting PostgreSQL..." -ForegroundColor Green

# Start PostgreSQL service
docker-compose up -d

Write-Host "PostgreSQL started successfully!" -ForegroundColor Green
Write-Host "PostgreSQL available at: localhost:5432" -ForegroundColor Cyan
Write-Host "Database: UserServiceDb" -ForegroundColor Cyan
Write-Host "Username: postgres" -ForegroundColor Cyan
Write-Host "Password: 123456" -ForegroundColor Cyan 