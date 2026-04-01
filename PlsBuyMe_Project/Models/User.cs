using System.ComponentModel.DataAnnotations;

namespace PlsBuyMe_Project.Models;

public class User
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Login jest wymagany.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Login musi mieć od 3 do 50 znaków.")]
    public string Login { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email jest wymagany.")]
    [EmailAddress(ErrorMessage = "To nie wygląda na poprawny email.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Hasło jest wymagane.")]
    public string Password { get; set; } = string.Empty;

    public string Role { get; set; } = "klient";
    public List<Purchase> Purchases { get; set; } = new();
}