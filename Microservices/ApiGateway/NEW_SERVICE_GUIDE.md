# Adding New Services to API Gateway

## 📝 Step-by-Step Guide

### 1. **Add Route Configuration**

Edit `appsettings.json` and add your new service route:

```json
{
  "ReverseProxy": {
    "Routes": {
      "your-new-service-route": {
        "ClusterId": "your-new-service-cluster",
        "Match": {
          "Path": "/api/your-service/{**catch-all}"
        },
        "Transforms": [
          { "PathPattern": "/api/your-service/{**catch-all}" }
        ],
        "AuthorizationPolicy": "default"  // Add this if authentication required
      }
    }
  }
}
```

### 2. **Add Cluster Configuration**

Add the destination cluster in the same `appsettings.json`:

```json
{
  "ReverseProxy": {
    "Clusters": {
      "your-new-service-cluster": {
        "Destinations": {
          "destination1": {
            "Address": "https://localhost:44572/"  // Your service URL
          }
        }
      }
    }
  }
}
```

### 3. **Update Token Validation Middleware**

If your service requires authentication, add it to the protected routes in `TokenValidationMiddleware.cs`:

```csharp
private readonly HashSet<string> _protectedRoutePrefixes = new()
{
    "/api/users",
    "/api/email", 
    "/api/news",
    "/api/charts",
    "/api/backtest",
    "/api/your-service"  // Add your service here
};
```

### 4. **Example: Adding News Service**

#### Route Configuration:
```json
"news-service-route": {
  "ClusterId": "news-service-cluster",
  "Match": {
    "Path": "/api/news/{**catch-all}"
  },
  "Transforms": [
    { "PathPattern": "/api/news/{**catch-all}" }
  ],
  "AuthorizationPolicy": "default"
}
```

#### Cluster Configuration:
```json
"news-service-cluster": {
  "Destinations": {
    "destination1": {
      "Address": "https://localhost:44569/"
    }
  }
}
```

### 5. **Service Types**

#### 🔒 **Protected Service** (Requires Authentication)
```json
{
  "your-protected-service-route": {
    "ClusterId": "protected-service-cluster",
    "Match": { "Path": "/api/protected/{**catch-all}" },
    "Transforms": [{ "PathPattern": "/api/protected/{**catch-all}" }],
    "AuthorizationPolicy": "default"  // ← This makes it protected
  }
}
```

#### ✅ **Public Service** (No Authentication)
```json
{
  "your-public-service-route": {
    "ClusterId": "public-service-cluster", 
    "Match": { "Path": "/api/public/{**catch-all}" },
    "Transforms": [{ "PathPattern": "/api/public/{**catch-all}" }]
    // No AuthorizationPolicy = public access
  }
}
```

### 6. **Testing New Service**

```bash
# 1. Start your new service
cd YourService && dotnet run

# 2. Test through API Gateway (if protected)
curl -X GET https://localhost:5001/api/your-service/endpoint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Test through API Gateway (if public)
curl -X GET https://localhost:5001/api/your-service/public-endpoint
```

### 7. **Load Balancing (Optional)**

For multiple instances of the same service:

```json
"your-service-cluster": {
  "Destinations": {
    "destination1": {
      "Address": "https://localhost:44572/"
    },
    "destination2": {
      "Address": "https://localhost:44573/"
    },
    "destination3": {
      "Address": "https://localhost:44574/"
    }
  }
}
```

### 8. **Health Checks (Optional)**

Add health check configuration:

```json
"your-service-cluster": {
  "HealthCheck": {
    "Active": {
      "Enabled": true,
      "Interval": "00:00:30",
      "Timeout": "00:00:05",
      "Policy": "ConsecutiveFailures",
      "Path": "/health"
    }
  },
  "Destinations": {
    "destination1": {
      "Address": "https://localhost:44572/",
      "Health": "https://localhost:44572/health"
    }
  }
}
```

## 🔄 Current Services Setup

| Service | Route | Port | Auth Required |
|---------|-------|------|---------------|
| UserService | `/api/users/*` | 44568 | ✅ Yes |
| UserService | `/api/auth/*` | 44568 | ❌ No |
| UserService | `/api/token/*` | 44568 | ❌ No |
| EmailService | `/api/email/*` | 44567 | ✅ Yes |
| NewsService | `/api/news/*` | 44569 | ✅ Yes |
| ChartService | `/api/charts/*` | 44570 | ✅ Yes |
| BacktestService | `/api/backtest/*` | 44571 | ✅ Yes |

## 🚀 Quick Add Template

Copy this template for any new service:

```json
// Add to Routes section
"SERVICE_NAME-service-route": {
  "ClusterId": "SERVICE_NAME-service-cluster",
  "Match": {
    "Path": "/api/SERVICE_NAME/{**catch-all}"
  },
  "Transforms": [
    { "PathPattern": "/api/SERVICE_NAME/{**catch-all}" }
  ],
  "AuthorizationPolicy": "default"
},

// Add to Clusters section  
"SERVICE_NAME-service-cluster": {
  "Destinations": {
    "destination1": {
      "Address": "https://localhost:PORT_NUMBER/"
    }
  }
}
```

Replace:
- `SERVICE_NAME` with your service name (e.g., `trading`, `analytics`)
- `PORT_NUMBER` with your service port (e.g., `44572`)
- Remove `"AuthorizationPolicy": "default"` if no auth needed