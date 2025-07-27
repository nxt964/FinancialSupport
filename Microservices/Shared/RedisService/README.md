# Shared Redis Service Library

This shared library provides Redis functionality for all microservices in the FinancialSupport project.

## Quick Setup for New Services

### 1. Add Project Reference

Add this project reference to your service's `.csproj` file:

```xml
<ItemGroup>
    <ProjectReference Include="../../Shared/RedisService/RedisService.csproj" />
</ItemGroup>
```

### 2. Add Configuration

Add Redis configuration to your `appsettings.json`:

```json
{
  "Redis": {
    "ConnectionString": "redis-cache:6379",
    "InstanceName": "YourServiceName:"
  }
}
```

### 3. Register Services

In your `Program.cs`, add one line:

```csharp
using Shared.RedisService;

// ... other code ...

builder.Services.AddRedisService(builder.Configuration);
```

### 4. Use in Your Code

```csharp
using Shared.RedisService;

public class SomeController : ControllerBase
{
    private readonly IRedisService _redisService;
    
    public SomeController(IRedisService redisService)
    {
        _redisService = redisService;
    }
    
    public async Task<IActionResult> GetData(string key)
    {
        var data = await _redisService.GetAsync<string>(key);
        return Ok(data);
    }
}
```

## Docker Setup

Add Redis to your service's `docker-compose.yml`:

```yaml
services:
  your-service:
    # ... your service config ...
    environment:
      - Redis__ConnectionString=redis-cache:6379
      - Redis__InstanceName=YourServiceName:
    depends_on:
      - redis-cache

  redis-cache:
    image: redis:7-alpine
    container_name: yourservice-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ../../Infras/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - yourservice-network

volumes:
  redis_data:
    driver: local

networks:
  yourservice-network:
    driver: bridge
```

## Available Methods

- `GetAsync<T>(string key)` - Retrieve a value
- `SetAsync<T>(string key, T value, TimeSpan? expiry)` - Store a value
- `DeleteAsync(string key)` - Remove a key
- `ExistsAsync(string key)` - Check if key exists
- `GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry)` - Get or create value
- `SetExpiryAsync(string key, TimeSpan expiry)` - Set expiry for existing key
- `GetTimeToLiveAsync(string key)` - Get remaining TTL

## Key Naming Convention

All keys are automatically prefixed with your service's `InstanceName` to avoid conflicts between services.

Example: If `InstanceName` is `"UserService:"`, a key `"user:123"` becomes `"UserService:user:123"` in Redis. 