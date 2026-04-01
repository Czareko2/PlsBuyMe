using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlsBuyMe_Project.Data;
using PlsBuyMe_Project.Models;

namespace PlsBuyMe_Project.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PurchasesController : ControllerBase
{
    private readonly ShopContext _context;

    public PurchasesController(ShopContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Purchase>>> GetPurchases()
    {
        return await _context.Purchases
            .Include(p => p.User)
            .Include(p => p.Product)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Purchase>> PostPurchase(Purchase purchase)
    {
        if (purchase.Date == DateTime.MinValue) 
            purchase.Date = DateTime.Now;

        _context.Purchases.Add(purchase);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetPurchases", new { id = purchase.Id }, purchase);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchase(int id)
    {
        var purchase = await _context.Purchases.FindAsync(id);
        if (purchase == null) return NotFound();

        _context.Purchases.Remove(purchase);
        await _context.SaveChangesAsync();
        return NoContent();
    }
    [HttpGet("{id}")]
    public async Task<ActionResult<Purchase>> GetPurchase(int id)
    {
        var purchase = await _context.Purchases
            .Include(p => p.User)    
            .Include(p => p.Product)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase == null)
        {
            return NotFound();
        }

        return purchase;
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPurchase(int id, Purchase purchase)
    {
        if (id != purchase.Id)
        {
            return BadRequest();
        }

        _context.Entry(purchase).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Purchases.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }
}