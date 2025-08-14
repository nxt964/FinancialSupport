# UserService

A microservice for user management and authentication in the FinancialSupport system, built with .NET 9.0 and following Clean Architecture principles.

## ✨ Features

### Authentication & Authorization
- User registration with email confirmation
- Login/logout functionality
- JWT token-based authentication
- Password reset with email verification
- Role-based access control
- Token refresh mechanism

### User Management
- CRUD operations for user profiles
- User role management
- Secure password handling
- User information updates

### Security
- JWT token validation
- Password hashing and validation
- Global exception handling

## 🚀 Getting Started

### Prerequisites
- .NET 9.0 SDK
- PostgreSQL database
- Redis server
- Kafka server

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/confirm-register` - Confirm registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/reset-password-request` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Management
- `GET /api/user/all` - Get all users (Admin only)
- `GET /api/user/{id}` - Get user by ID
- `PUT /api/user/update` - Update user information
- `PUT /api/user/role` - Update user role (Admin only)
- `DELETE /api/user/{id}` - Delete user


## 🗄️ Database

The service uses PostgreSQL with Entity Framework Core. Database migrations are automatically applied on startup.

### Key Entities
- **User** - User account information
- **ApplicationUser** - Identity user with custom properties

### Seed Data
The service automatically creates an initial admin user on first startup:

- **Username**: `admin`
- **Email**: `admin@financesupport.com`
- **Password**: `Admin@123`
- **Role**: `ProUser`
- **Profile Image**: Empty string

This seed data is created by `DatabaseContextSeed` and executed through `DatabaseInitializer` during application startup via `AutomatedMigration.MigrateAsync()`.

## 🔐 Security

- JWT tokens with configurable expiration
- Password hashing using ASP.NET Core Identity
- Role-based authorization
- Request validation and sanitization
- Global exception handling


## 📊 Monitoring

- Health checks for database connectivity
- Request logging middleware
- Performance metrics collection
- Error tracking and reporting
