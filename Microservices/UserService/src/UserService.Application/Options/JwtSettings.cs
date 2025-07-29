namespace UserService.Application.Options;

public class JwtSettings
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public int AccessTokenLifespanMinutes { get; set; } = 15;
    public int RefreshTokenLifespanMinutes { get; set; } = 1440;
}