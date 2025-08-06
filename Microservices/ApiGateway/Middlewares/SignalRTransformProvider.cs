using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;
using Yarp.ReverseProxy.Transforms.Builder;

namespace ApiGateway.Middlewares;

public class SignalRTransformProvider : ITransformProvider
{
    public void ValidateRoute(TransformRouteValidationContext context)
    {
    }

    public void ValidateCluster(TransformClusterValidationContext context)
    {
    }

    public void Apply(TransformBuilderContext context)
    {
        // Add SignalR-specific headers
        context.AddRequestTransform(async transformContext =>
        {
            // Ensure WebSocket headers are preserved
            if (transformContext.HttpContext.Request.Headers.ContainsKey("Upgrade"))
            {
                transformContext.ProxyRequest.Headers.Add("Upgrade", transformContext.HttpContext.Request.Headers["Upgrade"].ToString());
            }

            if (transformContext.HttpContext.Request.Headers.ContainsKey("Connection"))
            {
                transformContext.ProxyRequest.Headers.Add("Connection", transformContext.HttpContext.Request.Headers["Connection"].ToString());
            }
            
            if (transformContext.HttpContext.Request.Headers.ContainsKey("Sec-WebSocket-Key"))
            {
                transformContext.ProxyRequest.Headers.Add("Sec-WebSocket-Key", transformContext.HttpContext.Request.Headers["Sec-WebSocket-Key"].ToString());
            }
            
            if (transformContext.HttpContext.Request.Headers.ContainsKey("Sec-WebSocket-Version"))
            {
                transformContext.ProxyRequest.Headers.Add("Sec-WebSocket-Version", transformContext.HttpContext.Request.Headers["Sec-WebSocket-Version"].ToString());
            }
            
            if (transformContext.HttpContext.Request.Headers.ContainsKey("Sec-WebSocket-Protocol"))
            {
                transformContext.ProxyRequest.Headers.Add("Sec-WebSocket-Protocol", transformContext.HttpContext.Request.Headers["Sec-WebSocket-Protocol"].ToString());
            }
        });
    }
} 