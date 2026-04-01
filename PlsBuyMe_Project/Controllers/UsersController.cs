using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlsBuyMe_Project.Data;
using PlsBuyMe_Project.Models;

namespace PlsBuyMe_Project.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ShopContext _context;

    public UsersController(ShopContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Purchases)
            .ThenInclude(p => p.Product)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        return user;
    }

    [HttpPost]
    public async Task<ActionResult<User>> PostUser(User user)
    {
        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
        {
            return BadRequest(new { errors = new { Email = new[] { "Ten email jest już zajęty!" } } });
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetUser", new { id = user.Id }, user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest(new { errors = new { General = new[] { "Niezgodność ID." } } });
        }
        if (await _context.Users.AnyAsync(u => u.Email == user.Email && u.Id != id))
        {
            return BadRequest(new { errors = new { Email = new[] { "Ten email jest już zajęty!" } } });
        }

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Users.Any(e => e.Id == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }
}
