using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlsBuyMe_Project.Data;
using PlsBuyMe_Project.Models;

namespace PlsBuyMe_Project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ShopContext _context;

    public ProductsController(ShopContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()
    {
        return Ok(await _context.Products.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _context.Products
            .Include(p => p.Purchases)
            .ThenInclude(pur => pur.User)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (product == null)
        {
            return NotFound($"Nie znaleziono produktu o id: {id}");
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product newProduct)
    {
        _context.Products.Add(newProduct);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = newProduct.Id }, newProduct);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound($"Nie ma produktu o id: {id}");
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id)
        {
            return BadRequest(new { errors = new { General = new[] { "Niezgodność ID produktu." } } });
        }

        _context.Entry(product).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Products.Any(e => e.Id == id))
            {
                return NotFound(new { errors = new { General = new[] { "Produkt nie istnieje." } } });
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }
}