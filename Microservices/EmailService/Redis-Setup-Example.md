# Redis Setup Example for EmailService

This shows how easy it is to add Redis to any new service using the shared library.

## Step 1: Add Project Reference

Add to `EmailService.Application/EmailService.Application.csproj`:

```xml
<ItemGroup>
    <ProjectReference Include="..\..\Shared\RedisService\RedisService.csproj" />
</ItemGroup>
```

## Step 2: Add Configuration

Add to `EmailService.Api/appsettings.json`:

```json
{
  "Redis": {
    "ConnectionString": "redis-cache:6379",
    "InstanceName": "EmailService:"
  }
}
```

## Step 3: Register Services

Add to `EmailService.Api/Program.cs`:

```csharp
using Shared.RedisService;

// ... existing code ...

builder.Services.AddRedisService(builder.Configuration);
```

## Step 4: Use in Your Service

```csharp
using Shared.RedisService;

public class EmailService : IEmailService
{
    private readonly IRedisService _redisService;
    
    public EmailService(IRedisService redisService)
    {
        _redisService = redisService;
    }
    
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Cache email templates
        var template = await _redisService.GetOrSetAsync(
            $"email_template:{subject}",
            async () => await LoadTemplateFromDatabase(subject),
            TimeSpan.FromHours(24)
        );
        
        // Cache rate limiting
        var emailCount = await _redisService.GetAsync<int>($"email_count:{to}");
        if (emailCount > 10) // Max 10 emails per hour
        {
            throw new RateLimitExceededException();
        }
        
        await _redisService.SetAsync($"email_count:{to}", emailCount + 1, TimeSpan.FromHours(1));
        
        // Send email logic here...
    }
}
```

## Step 5: Docker Setup (Optional)

Add to `docker-compose.yml`:

```yaml
services:
  emailservice:
    # ... existing config ...
    environment:
      - Redis__ConnectionString=redis-cache:6379
      - Redis__InstanceName=EmailService:
    depends_on:
      - redis-cache

  redis-cache:
    image: redis:7-alpine
    container_name: emailservice-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ../../Infras/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - emailservice-network

volumes:
  redis_data:
    driver: local

networks:
  emailservice-network:
    driver: bridge
```

That's it! Just 4 simple steps and you have Redis working in any service. 