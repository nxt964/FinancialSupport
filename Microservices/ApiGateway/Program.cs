using ApiGateway.Middlewares;
using AspNetCoreRateLimit;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();

// Add health checks
builder.Services.AddHealthChecks();

// Add problem details
builder.Services.AddProblemDetails();

// Add exception handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Add HttpClient for token validation
builder.Services.AddHttpClient();

// Add YARP
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Add Redis for distributed rate limiting
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    options.InstanceName = "ApiGateway_";
});

// Add Rate Limiting with Redis
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimit"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.Configure<ClientRateLimitOptions>(builder.Configuration.GetSection("ClientRateLimit"));
builder.Services.Configure<ClientRateLimitPolicies>(builder.Configuration.GetSection("ClientRateLimitPolicies"));

builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseExceptionHandler();

app.UseHttpsRedirection();

// Add Rate Limiting Middleware
app.UseIpRateLimiting();
app.UseClientRateLimiting();
app.UseMiddleware<CustomRateLimitMiddleware>();

app.UseMiddleware<RequestLoggingMiddleware>();

// Custom token validation middleware (replaces JWT authentication)
app.UseMiddleware<TokenValidationMiddleware>();

app.UseCors();

// Add health check endpoint
app.MapHealthChecks("/health");

// Add a simple info endpoint
app.MapGet("/info", () => new
{
    Service = "API Gateway",
    Version = "1.0.0",
    Environment = app.Environment.EnvironmentName,
    Timestamp = DateTime.UtcNow
});

app.MapReverseProxy();

app.Run();
