# Quick Start: Adding Redis to Any Service

## The Problem
Previously, you had to repeat the same Redis setup steps for every service:
- Create IRedisService interface
- Create RedisService implementation  
- Add StackExchange.Redis package
- Register services in DI
- Configure connection strings
- Set up Docker

## The Solution
We created a **shared Redis library** that handles all of this for you!

## For New Services: Just 4 Steps

### 1. Add Project Reference (change to match your dir)
```xml
<!-- In your service's .csproj file -->
<ItemGroup>
    <ProjectReference Include="..\..\Shared\RedisService\RedisService.csproj" />
</ItemGroup>
```

### 2. Add Configuration (local:6379 if not use docker)
```json
// In appsettings.json
{
  "Redis": {
    "ConnectionString": "redis-cache:6379",
    "InstanceName": "YourServiceName:"
  }
}
```

### 3. Register Services
```csharp
// In Program.cs
using Shared.RedisService;

builder.Services.AddRedisService(builder.Configuration);
```

### 4. Use in Your Code
```csharp
// In any service/controller
using Shared.RedisService;

public class SomeService
{
    private readonly IRedisService _redisService;
    
    public SomeService(IRedisService redisService)
    {
        _redisService = redisService;
    }
    
    public async Task<SomeData> GetDataAsync(string key)
    {
        return await _redisService.GetOrSetAsync(
            $"data:{key}",
            async () => await LoadFromDatabase(key),
            TimeSpan.FromMinutes(30)
        );
    }
}
```

## What You Get

✅ **Automatic key prefixing** - No conflicts between services  
✅ **JSON serialization** - Works with any object  
✅ **TTL support** - Automatic expiration  
✅ **Cache-aside pattern** - Built-in GetOrSet functionality  
✅ **Connection management** - Handled automatically  
✅ **Dependency injection** - Ready to use  

## Docker Setup (Optional)

If you want Redis in your service's Docker setup:

```yaml
# In docker-compose.yml
services:
  your-service:
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
```

## That's It!

No more repeating the same Redis setup code. Just reference the shared library and you're ready to go! 