using Microsoft.EntityFrameworkCore;
using PlsBuyMe_Project.Models;

namespace PlsBuyMe_Project.Data;

public class ShopContext : DbContext
{
    public ShopContext(DbContextOptions<ShopContext> options) : base(options)
    {
    }
    public DbSet<Product> Products { get; set; }
    public DbSet<User> Users { get; set; } 
    public DbSet<Purchase> Purchases { get; set; }
}