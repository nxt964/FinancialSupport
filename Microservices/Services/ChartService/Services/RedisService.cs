using StackExchange.Redis;
using System.Data.Common;

public class RedisService
{
    private readonly ConnectionMultiplexer _redis;
    private readonly IDatabase _db;

    public RedisService(IConfiguration config)
    {
        var host = config["Redis:Host"] ?? "localhost";
        var port = config["Redis:Port"] ?? "17315";
        var password = config["Redis:Password"];

        var options = new ConfigurationOptions
        {
            EndPoints = { $"{host}:{port}" },
            User = "default",
            Password = password,
        };

        try
        {
            _redis = ConnectionMultiplexer.Connect(options);
            _db = _redis.GetDatabase();
            Console.WriteLine("[RedisService] Connected to Redis successfully");
            _redis.ConnectionFailed += (sender, args) =>
            {
                Console.WriteLine($"[RedisService] Connection failed: {args.Exception.Message}");
            };
            _redis.ConnectionRestored += (sender, args) =>
            {
                Console.WriteLine("[RedisService] Connection restored");
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RedisService] Failed to connect to Redis: {ex.Message}");
            throw;
        }
    }

    public async Task<string?> GetAsync(string key) => await _db.StringGetAsync(key);
    public async Task SetAsync(string key, string value, TimeSpan? expiry = null) => await _db.StringSetAsync(key, value, expiry);
}