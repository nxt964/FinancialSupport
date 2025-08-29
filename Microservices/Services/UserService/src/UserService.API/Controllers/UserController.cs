using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs.Users;
using UserService.Application.Exceptions;
using UserService.Application.Interfaces;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserAppService userAppService) : ApiController
{
    [Authorize]
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var users = await userAppService.GetAllAsync();
        return Success(users);
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            return Failure(new UnauthenticatedException());
        }
        
        var userId = Guid.Parse(userIdFromToken);
        var user = await userAppService.GetByIdAsync(userId);
        return Success(user);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userIdFromToken == null || userIdFromToken != id.ToString())
        {
            return userRole != "Admin" 
                ? Failure(new UnauthorizedException()) 
                : Failure(new UnauthenticatedException());
        }
        var user = await userAppService.GetByIdAsync(id);
        return Success(user);
    }
    
    [Authorize]
    [HttpPut("update")]
    public async Task<IActionResult> Update([FromBody] ChangeInfomationRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null || userIdFromToken != request.Id.ToString())
        {
            return Failure(new UnauthenticatedException());
        }
        request.Id = Guid.Parse(userIdFromToken);
        var response = await userAppService.UpdateAsync(request);
        return Success(response);
    }

    [Authorize]
    [HttpPut("role")]
    public async Task<IActionResult> UpdateRole([FromBody] UpdateRoleRequest request)
    {
        var response = await userAppService.UpdateRoleAsync(request);
        return Success(response);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userIdFromToken == null || userIdFromToken != id.ToString())
        {
            return userRole != "Admin" 
                ? Failure(new UnauthorizedException()) 
                : Failure(new UnauthenticatedException());
        }
        await userAppService.DeleteAsync(id);
        return Success("User deleted successfully.");
    }
}