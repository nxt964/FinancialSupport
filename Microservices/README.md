# Infrastructure Setup

This directory contains all infrastructure services for the microservices architecture.

## Services

- **Kafka** - Message broker for event-driven communication
- **Redis** - Caching and session storage
- **PostgreSQL** - Primary database

## Quick Start

### Start All Infrastructure
```powershell
# From project root
.\start-infrastructure.ps1

# Or
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

## Ports

| Service | Port | Description |
|---------|------|-------------|
| Kafka | 9092 | Message broker |
| Kafka UI | 8080 | Web interface |
| Zookeeper | 2181 | Kafka coordination |
| Redis | 6379 | Cache/Session store |
| PostgreSQL | 5432 | Database |

## Topics

The following Kafka topics are created automatically:
- `user-registered` - User registration events
- `password-reset` - Password reset events

## Monitoring

- **Kafka UI**: http://localhost:8080
- **Database**: Connect to localhost:5432
- **Redis**: Connect to localhost:6379 