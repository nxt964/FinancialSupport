using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using UserService.Domain.Const;
using UserService.Domain.Entities;
using UserService.Infrastructure.Identity;

namespace UserService.Infrastructure.Data;

public class ApplicationDbContext 
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public DbSet<User> Users { get; set; }
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.Entity<User>(b =>
        {
            b.ToTable("Users");
            b.Property(x => x.Id).IsRequired();
            b.Property(x => x.Username).IsRequired().HasMaxLength(UserConst.UsernameMaxLength);
            b.Property(x => x.Email).IsRequired().HasMaxLength(UserConst.EmailMaxLength);
            b.Property(x => x.ProfileImage).IsRequired().HasMaxLength(UserConst.ProfileImageMaxLength);
            b.Property(x => x.CreatedAt).IsRequired();
        });
    }
    
}