using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.API.Controllers;

[Route("/")]
[ApiController]
public class UnauthorizedController() : ApiController
{
    [HttpGet("/Account/Login")]
    [AllowAnonymous]
    public IActionResult Login()
    {
        return Failure<string>("Access denied");
    }
}