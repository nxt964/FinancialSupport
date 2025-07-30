# API Gateway

This API Gateway serves as the entry point for all microservices in the Financial Support system. It uses Microsoft YARP (Yet Another Reverse Proxy) for routing and JWT authentication for security.

## Features

- **Reverse Proxy**: Routes requests to appropriate microservices using YARP
- **JWT Authentication**: Validates tokens issued by UserService
- **HTTPS Communication**: All internal communication uses HTTPS
- **CORS Support**: Configured for cross-origin requests
- **OpenAPI/Swagger**: Available in development mode
- **Health Checks**: Built-in health monitoring endpoints
- **Request Logging**: Comprehensive request/response logging
- **Global Exception Handling**: Centralized error handling
- **Docker Support**: Containerized deployment ready

## Configuration

### Running Services

The API Gateway expects the following services to be running:

- **UserService**: `https://localhost:44568`
- **EmailService**: `https://localhost:44567`

### Ports

- **API Gateway**: `https://localhost:5001` (HTTPS), `http://localhost:5000` (HTTP)

### Routes

| Route | Target Service | Authentication Required |
|-------|----------------|------------------------|
| `/api/auth/*` | UserService | No |
| `/api/token/*` | UserService | No |
| `/api/users/*` | UserService | Yes (JWT) |
| `/api/email/*` | EmailService | Yes (JWT) |

## Usage

### 1. Start Required Services

First, ensure UserService is running:
```bash
cd Services/UserService/src/UserService.API
dotnet run
```

### 2. Start API Gateway

```bash
cd ApiGateway
dotnet run
```

### 3. Access Swagger UI

Navigate to: `https://localhost:5001/swagger`

### 4. Test Authentication Flow

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` → Get JWT token
3. **Use Protected Endpoints**: Include `Authorization: Bearer {token}` header

## Example Requests

### Register User
```http
POST https://localhost:5001/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```http
POST https://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Access Protected Endpoint
```http
GET https://localhost:5001/api/users/profile
Authorization: Bearer {your-jwt-token}
```

## Security

- JWT tokens are validated using the same key as UserService
- Email service routes require authentication
- HTTPS is enforced for all communication
- CORS is configured for development (adjust for production)

## Additional Endpoints

### System Endpoints

- `GET /health` - Health check endpoint
- `GET /info` - API Gateway information
- `GET /swagger` - OpenAPI documentation (development only)

## Development

- Detailed YARP logging is enabled in development
- Request/response logging via custom middleware
- Global exception handling for better error responses
- Swagger UI is available at `/swagger`
- Use the provided `.http` file for testing endpoints

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

### Individual Docker Build

```bash
# Build the API Gateway image
docker build -t api-gateway .

# Run the container
docker run -p 5001:443 -p 5000:80 api-gateway
```

## Troubleshooting

### Common Issues

1. **JWT Key Missing**: Ensure `Jwt:Key` is configured in appsettings.json
2. **Service Unavailable**: Check that UserService is running on `https://localhost:44568`
3. **CORS Errors**: Verify CORS configuration for your client application
4. **Health Check Failures**: Use `/health` endpoint to diagnose service status

### Logs

- Request/response details are logged at Information level
- Errors are logged with full exception details
- YARP routing information is available in Debug mode