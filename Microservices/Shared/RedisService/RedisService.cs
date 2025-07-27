using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
using System.Text.Json;

namespace Shared.RedisService;

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _database;
    private readonly string _instanceName;

    public RedisService(IConnectionMultiplexer redis, IConfiguration configuration)
    {
        _redis = redis;
        _database = redis.GetDatabase();
        _instanceName = configuration["Redis:InstanceName"] ?? "Default:";
    }

    private string GetFullKey(string key) => $"{_instanceName}{key}";

    public async Task<T?> GetAsync<T>(string key)
    {
        var fullKey = GetFullKey(key);
        var value = await _database.StringGetAsync(fullKey);
        
        if (!value.HasValue)
            return default;

        return JsonSerializer.Deserialize<T>(value!);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var fullKey = GetFullKey(key);
        var serializedValue = JsonSerializer.Serialize(value);
        
        await _database.StringSetAsync(fullKey, serializedValue, expiry);
    }

    public async Task<bool> DeleteAsync(string key)
    {
        var fullKey = GetFullKey(key);
        return await _database.KeyDeleteAsync(fullKey);
    }

    public async Task<bool> ExistsAsync(string key)
    {
        var fullKey = GetFullKey(key);
        return await _database.KeyExistsAsync(fullKey);
    }

    public async Task<T?> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
    {
        var fullKey = GetFullKey(key);
        var value = await _database.StringGetAsync(fullKey);
        
        if (value.HasValue)
        {
            return JsonSerializer.Deserialize<T>(value!);
        }

        var newValue = await factory();
        await SetAsync(key, newValue, expiry);
        return newValue;
    }

    public async Task<bool> SetExpiryAsync(string key, TimeSpan expiry)
    {
        var fullKey = GetFullKey(key);
        return await _database.KeyExpireAsync(fullKey, expiry);
    }

    public async Task<TimeSpan?> GetTimeToLiveAsync(string key)
    {
        var fullKey = GetFullKey(key);
        return await _database.KeyTimeToLiveAsync(fullKey);
    }
} 