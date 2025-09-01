using ApiGateway.Middlewares;
using AspNetCoreRateLimit;
using Yarp.ReverseProxy.Transforms;

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
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddTransforms<SignalRTransformProvider>();

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
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("X-User-Id", "X-User-Email", "X-User-Role");
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseExceptionHandler();

app.UseHttpsRedirection();

app.UseMiddleware<RequestLoggingMiddleware>();

// Custom token validation middleware (replaces JWT authentication)
app.UseMiddleware<TokenValidationMiddleware>();

// Custom rate limiting middleware (sets ClientId based on user role)
app.UseMiddleware<CustomRateLimitMiddleware>();

// Add Rate Limiting Middleware (after custom middleware sets ClientId)
app.UseIpRateLimiting();
app.UseClientRateLimiting();

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
app.UseWebSockets();
app.MapReverseProxy();

app.Run();
