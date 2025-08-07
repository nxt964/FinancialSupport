using UserService.API;
using UserService.API.Middlewares;
using Shared.RedisService;
using UserService.Application;
using UserService.Infrastructure;
using UserService.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApi();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddRedisService(builder.Configuration);
builder.Services.AddAuthorization();
builder.Services.AddSwaggerServices();

var app = builder.Build();

// Auto-migrate database\
app.Logger.LogInformation("✅ Starting Program.cs");
app.Logger.LogInformation("start to migrates");
using (var scope = app.Services.CreateScope())
{
    await AutomatedMigration.MigrateAsync(scope.ServiceProvider);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "FinancialSupport API v1"); });
}

app.UseHttpsRedirection();
app.UseMiddleware<UserApiMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.UseMiddleware<GlobalExceptionHandler>();

app.Run();