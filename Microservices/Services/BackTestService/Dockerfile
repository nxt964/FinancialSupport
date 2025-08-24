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

# Install Python + pip and required system dependencies for ta-lib
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    wget \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install ta-lib from source (more reliable than package managers)
RUN wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz \
    && tar -xzf ta-lib-0.4.0-src.tar.gz \
    && cd ta-lib/ \
    && ./configure --prefix=/usr \
    && make \
    && make install \
    && cd .. \
    && rm -rf ta-lib ta-lib-0.4.0-src.tar.gz

WORKDIR /app

# Copy published .NET app
COPY --from=build /app/publish .

# Copy Python script into container
COPY Services/BackTestService/python/backtest.py ./python/backtest.py

# Copy certificates for HTTPS
RUN mkdir -p /app/certs 

# Allow pip to install system-wide
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Install Python dependencies
RUN pip3 install pandas backtesting ta-lib

# Expose ports (matching Program.cs configuration - standard Docker ports)
EXPOSE 80
EXPOSE 443

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1
    CMD curl -f https://localhost:443/health || exit 1

ENTRYPOINT ["dotnet", "BackTestService.dll"]
