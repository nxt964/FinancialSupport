namespace UserService.Domain.Entities;

public class ChartSubciption
{
    public Guid UserId { get; set; }
    public string Symbol { get; set;}
    public string Interval { get; set; }
}