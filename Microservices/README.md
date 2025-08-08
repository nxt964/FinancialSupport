# Financial Support Microservices

A microservices architecture with API Gateway, User Service, Email Service, and Chart Service.

## Services

- **API Gateway** - Reverse proxy and rate limiting
- **User Service** - User management and authentication
- **Email Service** - Email notifications
- **Chart Service** - Real-time chart data
- **Kafka** - Message broker for event-driven communication
- **Redis** - Caching and session storage
- **PostgreSQL** - Primary database

## Quick Start

### HTTPS Setup
1. Generate certificates:
   ```bash
   chmod +x certs/generate-certs.sh
   ./certs/generate-certs.sh
   ```

2. Configure environment variables in `docker.env`

3. Start services:
   ```bash
   docker-compose --env-file docker.env up -d
   ```

### HTTP Setup (Development)
```bash
docker-compose up -d
```

### Start Individual Services

#### Kafka Only
```powershell
cd kafka
.\start-kafka.ps1
```

#### Redis Only
```powershell
cd redis
.\start-redis.ps1
```

#### PostgreSQL Only
```powershell
cd postgres
.\start-postgres.ps1
```

## Service URLs

### HTTPS
- **API Gateway**: https://localhost:5001
- **User Service**: https://localhost:44569
- **Email Service**: https://localhost:44570
- **Chart Service**: https://localhost:7115

### HTTP (Development)
- **API Gateway**: http://localhost:5000
- **User Service**: http://localhost:44568
- **Email Service**: http://localhost:44567
- **Chart Service**: http://localhost:7114

## Infrastructure Ports

| Service | Port | Description |
|---------|------|-------------|
| Kafka | 9092 | Message broker |
| Kafka UI | 8080 | Web interface |
| Zookeeper | 2181 | Kafka coordination |
| Redis | 6379 | Cache/Session store |
| PostgreSQL | 5432 | Database |

## Environment Configuration

Edit `docker.env` to customize:
- Service ports
- Database credentials
- Email settings
- API keys

## Certificate Management

- Self-signed certificates in `certs/` directory
- Regenerate with: `./certs/generate-certs.sh` (Linux/macOS) or `powershell -ExecutionPolicy Bypass -File certs/generate-certs.ps1` (Windows)
- Password: `password`
- Valid for 365 days
- Certificate validation disabled for development (`AllowInvalid: true`)

## Topics

The following Kafka topics are created automatically:
- `user-registered` - User registration events
- `password-reset` - Password reset events

## Monitoring

- **Kafka UI**: http://localhost:8080
- **Database**: Connect to localhost:5432
- **Redis**: Connect to localhost:6379 