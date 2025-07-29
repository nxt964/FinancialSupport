# UserService with Redis Configuration

This document explains how Redis is configured and used in the UserService.

## Redis Configuration

### 1. Connection Settings

Redis is configured in `appsettings.json`:

```json
{
  "Redis": {
    "ConnectionString": "redis-cache:6379",
    "InstanceName": "UserService:"
  }
}
```

- **ConnectionString**: Points to the Redis container in Docker
- **InstanceName**: Prefix for all Redis keys to avoid conflicts

### 2. Docker Setup

The service includes a `docker-compose.yml` file that sets up:
- UserService API
- PostgreSQL database
- Redis cache

To run the entire stack:

```bash
cd Microservices/UserService
docker-compose up -d
```

### 3. Redis Service

The `IRedisService` interface provides the following methods:

- `GetAsync<T>(string key)` - Retrieve a value from Redis
- `SetAsync<T>(string key, T value, TimeSpan? expiry)` - Store a value with optional expiry
- `DeleteAsync(string key)` - Remove a key from Redis
- `ExistsAsync(string key)` - Check if a key exists
- `GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry)` - Get value or create if not exists
- `SetExpiryAsync(string key, TimeSpan expiry)` - Set expiry for existing key
- `GetTimeToLiveAsync(string key)` - Get remaining TTL for a key

### 4. Usage Examples

#### Token Caching

The `TokenAppService` uses Redis to store refresh tokens:

```csharp
// Store refresh token with 7-day expiry
var refreshTokenKey = $"refresh_token:{refreshToken}";
var tokenData = new { UserId = userId, Email = email, CreatedAt = DateTime.UtcNow };
await _redisService.SetAsync(refreshTokenKey, tokenData, TimeSpan.FromDays(7));

// Validate refresh token
var isValid = await _redisService.ExistsAsync(refreshTokenKey);

// Revoke refresh token
await _redisService.DeleteAsync(refreshTokenKey);
```

#### User Session Caching

```csharp
// Cache user session data
var sessionKey = $"user_session:{userId}";
var sessionData = new { UserId = userId, LastActivity = DateTime.UtcNow };
await _redisService.SetAsync(sessionKey, sessionData, TimeSpan.FromHours(24));

// Get cached session
var session = await _redisService.GetAsync<dynamic>(sessionKey);
```

#### Cache-Aside Pattern

```csharp
// Get user data with caching
var userData = await _redisService.GetOrSetAsync(
    $"user:{userId}",
    async () => await _userRepository.GetByIdAsync(userId),
    TimeSpan.FromMinutes(30)
);
```

## Development

### Running Locally

1. Start Redis using the infrastructure setup:
   ```bash
   cd Infras/redis
   docker-compose up -d
   ```

2. Update `appsettings.Development.json` to use localhost:
   ```json
   {
     "Redis": {
       "ConnectionString": "localhost:6379",
       "InstanceName": "UserService:"
     }
   }
   ```

3. Run the UserService:
   ```bash
   cd Microservices/UserService/src/UserService.API
   dotnet run
   ```

### Testing Redis Connection

You can test the Redis connection by:

1. Using Redis CLI:
   ```bash
   docker exec -it userservice-redis redis-cli
   ```

2. Testing basic operations:
   ```bash
   SET UserService:test "Hello Redis"
   GET UserService:test
   ```

## Production Considerations

1. **Security**: Enable Redis password authentication in production
2. **Persistence**: Configure Redis persistence for data durability
3. **Monitoring**: Set up Redis monitoring and alerting
4. **Scaling**: Consider Redis Cluster for high availability
5. **Backup**: Implement regular Redis data backups

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure Redis container is running
2. **Key not found**: Check if the key prefix (InstanceName) is correct
3. **Serialization errors**: Ensure objects are serializable

### Debug Commands

```bash
# Check Redis container status
docker ps | grep redis

# View Redis logs
docker logs userservice-redis

# Connect to Redis and check keys
docker exec -it userservice-redis redis-cli
KEYS UserService:*
``` 