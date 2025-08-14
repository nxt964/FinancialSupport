# Use the official .NET 9.0 SDK image as the base image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set the working directory
WORKDIR /src

# Copy the solution file and project files
COPY ["Services/EmailService/EmailService.sln", "Services/EmailService/"]
COPY ["Services/EmailService/src/EmailService.Api/EmailService.Api.csproj", "Services/EmailService/src/EmailService.Api/"]
COPY ["Services/EmailService/src/EmailService.Application/EmailService.Application.csproj", "Services/EmailService/src/EmailService.Application/"]
COPY ["Services/EmailService/src/EmailService.Domain/EmailService.Domain.csproj", "Services/EmailService/src/EmailService.Domain/"]
COPY ["Services/EmailService/src/EmailService.Infrastructure/EmailService.Infrastructure.csproj", "Services/EmailService/src/EmailService.Infrastructure/"]

# Copy Shared projects
COPY ["Shared/RedisService/RedisService.csproj", "Shared/RedisService/"]
COPY ["Shared/KafkaService/KafkaService.csproj", "Shared/KafkaService/"]
COPY ["Shared/Events/Events.csproj", "Shared/Events/"]

# Restore dependencies
RUN dotnet restore "Services/EmailService/EmailService.sln"

# Copy the rest of the source code
COPY . .

# Build the application
RUN dotnet build "Services/EmailService/EmailService.sln" -c Release -o /app/build

# Publish the application
RUN dotnet publish "Services/EmailService/src/EmailService.Api/EmailService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

# Set the working directory
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Copy the Templates folder to maintain the EmailService.Application structure
COPY --from=build /src/Services/EmailService/src/EmailService.Application/Templates ./EmailService.Application/Templates

# Create certificates directory
RUN mkdir -p /app/certs

# Expose port 80 and 443
EXPOSE 80
EXPOSE 443

# Set the entry point
ENTRYPOINT ["dotnet", "EmailService.Api.dll"]
