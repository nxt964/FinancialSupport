namespace EmailService.Application.DTOs.Users;

public class ConfirmNewEmail
{
    
    public string Email { get; set; }
    public string Username { get; set; }
    public string ConfirmationLink { get; set; }
}