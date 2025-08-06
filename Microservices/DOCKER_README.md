# Microservices Docker Setup

This project is fully dockerized with all microservices and infrastructure components.

## Architecture

- **API Gateway**: Entry point for all client requests
- **User Service**: User management and authentication
- **Email Service**: Email sending functionality
- **Infrastructure**: Kafka, Redis, PostgreSQL

## Services Overview

| Service | Port (HTTP) | Port (HTTPS) | Description |
|---------|-------------|--------------|-------------|
| API Gateway | 5000 | 5001 | Main entry point |
| User Service | 44567 | 44568 | User management |
| Email Service | 44570 | 44569 | Email functionality |
| PostgreSQL | 5432 | - | Database |
| Redis | 6379 | - | Cache/Message broker |
| Kafka UI | 8080 | - | Kafka management UI |

## Quick Start

### Prerequisites
- Docker Desktop
- Docker Compose

### Start All Services
```bash
docker-compose up -d
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
docker-compose build

# Build specific service
docker-compose build user-service
```

### Rebuilding After Code Changes
```bash
docker-compose up -d --build
```

## Service Dependencies

- **API Gateway** → User Service, Email Service
- **User Service** → PostgreSQL, Redis
- **Email Service** → Redis
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
PostgreSQL connection string: `Host=postgres;Port=5432;Database=UserServiceDb;Username=postgres;Password=123456`

## Environment Variables

All services use `ASPNETCORE_ENVIRONMENT=Development` by default. For production, update the environment variables in `docker-compose.yml`. 