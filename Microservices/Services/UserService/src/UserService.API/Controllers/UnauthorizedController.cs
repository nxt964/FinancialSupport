using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Exceptions;

namespace UserService.API.Controllers;

[Route("/")]
[ApiController]
public class UnauthorizedController() : ApiController
{
    [HttpGet("/Account/Login")]
    [AllowAnonymous]
    public IActionResult Login()
    {
        return Failure(new UnauthenticatedException());
    }
}