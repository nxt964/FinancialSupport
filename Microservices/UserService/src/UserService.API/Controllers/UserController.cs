using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs.Users;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserAppService userAppService) : ApiController
{
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await userAppService.GetAllAsync();
        return Ok(users);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null || userIdFromToken != id.ToString())
        {
            return Forbid();
        }
        var user = await userAppService.GetByIdAsync(id);
        return Ok(user);
    }
    
    [Authorize]
    [HttpPut("update")]
    public async Task<IActionResult> Update([FromBody] ChangeInfomationRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null || userIdFromToken != request.Id.ToString())
        {
            return Forbid();
        }
        request.Id = Guid.Parse(userIdFromToken);
        var response = await userAppService.UpdateAsync(request);
        return Ok(response);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null || userIdFromToken != id.ToString())
        {
            return Forbid();
        }
        await userAppService.DeleteAsync(id);
        return Ok(new { Message = "User deleted successfully." });
    }
}