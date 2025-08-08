# Use the official .NET 9.0 SDK image as the base image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set the working directory
WORKDIR /src

# Copy the solution file and project files
COPY ["Services/UserService/UserService.sln", "Services/UserService/"]
COPY ["Services/UserService/src/UserService.API/UserService.API.csproj", "Services/UserService/src/UserService.API/"]
COPY ["Services/UserService/src/UserService.Application/UserService.Application.csproj", "Services/UserService/src/UserService.Application/"]
COPY ["Services/UserService/src/UserService.Domain/UserService.Domain.csproj", "Services/UserService/src/UserService.Domain/"]
COPY ["Services/UserService/src/UserService.Infrastructure/UserService.Infrastructure.csproj", "Services/UserService/src/UserService.Infrastructure/"]

# Copy Shared projects
COPY ["Shared/RedisService/RedisService.csproj", "Shared/RedisService/"]
COPY ["Shared/KafkaService/KafkaService.csproj", "Shared/KafkaService/"]
COPY ["Shared/Events/Events.csproj", "Shared/Events/"]

# Restore dependencies
RUN dotnet restore "Services/UserService/UserService.sln"

# Copy the rest of the source code
COPY . .

# Build the application
RUN dotnet build "Services/UserService/UserService.sln" -c Release -o /app/build

# Publish the application
RUN dotnet publish "Services/UserService/src/UserService.API/UserService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

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
ENTRYPOINT ["dotnet", "UserService.API.dll"]
