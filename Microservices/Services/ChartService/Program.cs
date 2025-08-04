using Binance.Net.Clients;
using Binance.Net.Enums;
using ChartsService.Services;
using Microsoft.AspNetCore.SignalR;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Đăng ký IHubContext cho SignalR
        builder.Services.AddSignalR();

        builder.Services.AddSingleton<BinanceCollectorManager>();

        builder.Services.AddSingleton<ChartBroadcastService>();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        var app = builder.Build();

        app.UseCors("AllowFrontend");
        app.UseRouting();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ChartHub>("/chartHub");
        });

        app.Run();
    }
}