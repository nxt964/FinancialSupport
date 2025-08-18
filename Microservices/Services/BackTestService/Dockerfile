# ---------- Build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project files and restore
COPY ["Services/BackTestService/BackTestService.csproj", "Services/BackTestService/"]
RUN dotnet restore "Services/BackTestService/BackTestService.csproj"

# Copy everything and build
COPY . .
RUN dotnet publish "Services/BackTestService/BackTestService.csproj" -c Release -o /app/publish /p:UseAppHost=false


# ---------- Runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy published .NET app
COPY --from=build /app/publish .

# Copy Python script into container
COPY Services/BackTestService/python/backtest.py ./python/backtest.py

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Allow pip to install system-wide
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Install Python dependencies
RUN pip3 install pandas backtesting ta-lib

# Expose ports (as defined in Program.cs)
EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "BackTestService.dll"]
