using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/Users")]
    [ApiController]
    public class UserApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public UserApiController(CMSDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            if (users == null || !users.Any()) return NotFound(new { message = "Không tìm thấy người dùng nào." });
            return Ok(users);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = $"Không tìm thấy người dùng ID = {id}." });
            return Ok(user);
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<ActionResult<User>> PostUser([FromBody] User user)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, [FromBody] User user)
        {
            if (id != user.Id) return BadRequest(new { message = "ID không khớp." });
            _context.Entry(user).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) {
                if (!_context.Users.Any(e => e.Id == id)) return NotFound(new { message = "Người dùng không tồn tại." });
                else throw;
            }
            return Ok(new { message = "Cập nhật thành công!", data = user });
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa người dùng thành công." });
        }
    }
}
