

using Microsoft.OpenApi.Models;
using BacktestService.Services;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Binance Backtest API", Version = "v1" });
        });

        // Register services
        builder.Services.AddSingleton<BinanceService>();
        builder.Services.AddSingleton<BacktestRunner>();

        // CORS - Similar to ChartsService but allow any origin for backtest service
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowCORS", policy =>
            {
                policy.WithOrigins("https://localhost:5001", "http://localhost:5000")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        var app = builder.Build();

        app.UseCors("AllowCORS");
        app.UseRouting();

        // Always show Swagger for development and testing
        app.UseSwagger();
        app.UseSwaggerUI();

        // Use UseEndpoints similar to ChartsService
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        // FORCE PORT 7207 để tránh conflict với API Gateway (port 5000)
        app.Urls.Clear();

        Console.WriteLine("BackTestService starting on:");
        Console.WriteLine("HTTP:  http://localhost:7206");
        Console.WriteLine("HTTPS: https://localhost:7207");
        
        app.Run();
    }
}
    