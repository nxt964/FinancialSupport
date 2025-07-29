namespace UserService.Application.DTOs;

public class BaseReponse
{
    public Guid? Id { get; set; }
    
    public string? Message { get; set; }
}