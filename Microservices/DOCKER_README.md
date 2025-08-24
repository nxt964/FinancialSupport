# Microservices Docker Setup

This project is fully dockerized with all microservices and infrastructure components.

## Architecture

- **API Gateway**: Entry point for all client requests
- **User Service**: User management and authentication
- **Email Service**: Email sending functionality
- **Chart Service** - Real-time chart data
- **Backtest Service** - Backtest service
- **News Service** - Service to fetch news
- **Infrastructure**: Kafka, Redis, PostgreSQL

## Services Overview

| Service | Port (HTTP) | Port (HTTPS) | Description |
|---------|-------------|--------------|-------------|
| API Gateway | 5000 | 5001 | Main entry point |
| User Service | 5002 | 44568 | User management |
| Email Service | 5003 | 44567 | Email functionality |
| ChartService | 5004 | 7114| Chart Functionanlity |
| NewsService | 5005 | - | News Functionanlity |
| BacktestService | 7206 | 7207 | Backtest Functionanlity |
| PostgreSQL | 5432 | - | Database |
| Redis | 6379 | - | Cache/Message broker |
| Kafka UI | 8080 | - | Kafka management UI |

## Quick Start

### Prerequisites
- Docker Desktop
- Docker Compose

### Start All Services
```bash
docker-compose --env-file docker.env up -d
```

### Start Specific Services
```bash
# Start only infrastructure
docker-compose up -d zookeeper kafka redis postgres

# Start only microservices
docker-compose up -d api-gateway user-service email-service
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
```

## Development

### Building Services
```bash
# Build all services
docker-compose --env-file docker.env up --build

# Build specific service
docker-compose --env-file docker.env up --build user-service
```

### Rebuilding After Code Changes
```bash
docker-compose --env-file docker.env up --build
```

## Service Dependencies

- **API Gateway** → User Service, Email Service
- **User Service** → PostgreSQL, Redis, Kafka
- **Email Service** → Redis, Kafka
- **Backtest Service** → Kafka, Redis
- **Kafka** → Zookeeper

## Network

All services communicate through the `microservices-network` bridge network.

## Volumes

- `postgres-data`: PostgreSQL database persistence
- `redis-data`: Redis data persistence
- `kafka-data`: Kafka data persistence
- `zookeeper-data`: Zookeeper data persistence

## Troubleshooting

### Port Conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`.

### Certificate Issues (API Gateway)
For HTTPS to work, ensure SSL certificates are available at `~/.aspnet/https/`.

### Database Connection
PostgreSQL connection string: `Host=postgres;Port=5432;Database={POSTGRES_DB};Username={POSTGRES_USER};Password={POSTGRES_PASSWORD}`

## Environment Variables

All services use `ASPNETCORE_ENVIRONMENT=Production` by default. For development, update the environment variables in `docker-compose.yml`. 