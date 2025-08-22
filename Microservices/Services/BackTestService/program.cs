﻿using Microsoft.OpenApi.Models;
using BacktestService.Services;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Configure JSON options for better handling
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                options.JsonSerializerOptions.WriteIndented = true;
            });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Binance Backtest API", Version = "v1" });
        });

        // Register services
        builder.Services.AddSingleton<BinanceService>();
        builder.Services.AddSingleton<BacktestRunner>();
        builder.Services.AddScoped<SendBacktestResult>();


        // CORS - Allow API Gateway
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowCORS", policy =>
            {
                policy.WithOrigins(
                    "https://localhost:5001", 
                    "http://localhost:5000",  // API Gateway
                    "http://localhost:3000",  // React dev server  
                    "http://localhost:5173"   // Vite dev server
                )
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

        app.MapControllers();

        // Configure URLs - Make sure both HTTP and HTTPS work
        app.Urls.Clear();
        app.Urls.Add("http://localhost:7206");   // HTTP fallback
        app.Urls.Add("https://localhost:7207");  // HTTPS - match gateway config
        
        // Bypass HTTPS certificate validation for development
        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        // Ensure data directory exists
        Directory.CreateDirectory("data");
        Directory.CreateDirectory("python");

        Console.WriteLine("BackTestService starting on:");
        Console.WriteLine("HTTP:  http://localhost:5000");
        Console.WriteLine("HTTPS: https://localhost:5001");
        Console.WriteLine("Data folder: ./data");
        Console.WriteLine("Python folder: ./python");
        
        app.Run();
    }
}