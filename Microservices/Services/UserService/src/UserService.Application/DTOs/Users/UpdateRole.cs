namespace UserService.Application.DTOs.Users;

public class UpdateRoleRequest
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
} 

public class UpdateRoleResponse
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
