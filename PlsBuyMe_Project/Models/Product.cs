using System.ComponentModel.DataAnnotations;

namespace PlsBuyMe_Project.Models;

public class Product
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Produkt musi mieć nazwę.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Nazwa musi mieć od 3 do 100 znaków.")]
    public string Name { get; set; } = string.Empty;
    
    public string? Code { get; set; } 
    
    [Range(0.01, 100000, ErrorMessage = "Cena nie może być ujemna ani zerowa!")]
    public decimal Price { get; set; }

    public string? Size { get; set; }

    public string? Color { get; set; }

    public string? Description { get; set; }
    public List<Purchase> Purchases { get; set; } = new();
}