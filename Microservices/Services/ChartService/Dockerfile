# Use the official .NET 8.0 SDK image as the base image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["Services/ChartService/ChartService.csproj", "Services/ChartService/"]
COPY ["Shared/RedisService/RedisService.csproj", "Shared/RedisService/"]
RUN dotnet restore "Services/ChartService/ChartService.csproj"

# Copy the rest of the source code
COPY . .

# Build the application
RUN dotnet build "Services/ChartService/ChartService.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "Services/ChartService/ChartService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Set the working directory
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Create certificates directory
RUN mkdir -p /app/certs

# Expose port 80 and 443
EXPOSE 80
EXPOSE 443

# Set the entry point
ENTRYPOINT ["dotnet", "ChartService.dll"]
