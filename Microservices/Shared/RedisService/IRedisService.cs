using System.Text.Json;

namespace Shared.RedisService;

public interface IRedisService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task<bool> DeleteAsync(string key);
    Task<bool> ExistsAsync(string key);
    Task<T?> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null);
    Task<bool> SetExpiryAsync(string key, TimeSpan expiry);
    Task<TimeSpan?> GetTimeToLiveAsync(string key);
} 