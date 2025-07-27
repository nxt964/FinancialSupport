namespace EmailService.Application.DTOs.Users;

public class ResetPassword
{
    public string Email { get; set; }
    public string Code { get; set; }
}