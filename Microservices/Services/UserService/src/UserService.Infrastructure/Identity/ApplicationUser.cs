﻿using Microsoft.AspNetCore.Identity;

namespace UserService.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public DateTime CreatedAt { get; set; }
}