using System.ComponentModel.DataAnnotations;

namespace PlsBuyMe_Project.Models;

public class Purchase
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; } 

    public int ProductId { get; set; }
    public Product? Product { get; set; } 

    public int Quantity { get; set; } = 1;

    public DateTime Date { get; set; } = DateTime.Now;

    public string Status { get; set; } = "Nowe";
}