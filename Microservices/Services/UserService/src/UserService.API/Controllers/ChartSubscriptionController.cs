using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs.ChartSubscriptions;
using UserService.Application.Exceptions;
using UserService.Application.Interfaces;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/chart-subscription")]
public class ChartSubscriptionController(IChartSubscriptionAppService chartSubscriptionAppService) : ApiController
{
    [Authorize]
    [HttpPost("follow")]
    public async Task<IActionResult> FollowChart([FromBody] SubscribeToChartRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            return Failure(new UnauthenticatedException());
        }
        
        var userId = Guid.Parse(userIdFromToken);
        var result = await chartSubscriptionAppService.SubscribeToChartAsync(userId, request);
        
        if (result)
        {
            return Success("Successfully subscribed to chart");
        }
        
        return Failure<string>("Failed to subscribe to chart");
    }

    [Authorize]
    [HttpPost("unfollow")]
    public async Task<IActionResult> UnfollowChart([FromBody] UnsubscribeFromChartRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            return Failure(new UnauthenticatedException());
        }
        
        var userId = Guid.Parse(userIdFromToken);
        var result = await chartSubscriptionAppService.UnsubscribeFromChartAsync(userId, request);
        
        if (result)
        {
            return Success("Successfully unsubscribed from chart");
        }
        
        return Failure<string>("Failed to unsubscribe from chart");
    }

    [Authorize]
    [HttpGet("followed")]
    public async Task<IActionResult> GetFollowedCharts()
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            return Failure(new UnauthenticatedException());
        }
        var targetUserId = Guid.Parse(userIdFromToken);

        var result = await chartSubscriptionAppService.GetAllSubscriptionsAsync(targetUserId);
        
        return Success(result);
    }
}
