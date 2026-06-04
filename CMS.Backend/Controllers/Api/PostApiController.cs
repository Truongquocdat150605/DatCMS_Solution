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
    [Route("api/Posts")]
    [ApiController]
    public class PostApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public PostApiController(CMSDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
        {
            var posts = await _context.Posts.Include(p => p.Category).ToListAsync();
            if (posts == null || !posts.Any()) return NotFound(new { message = "Không tìm thấy bài viết nào." });
            return Ok(posts);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Post>> GetPost(int id)
        {
            var post = await _context.Posts.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return NotFound(new { message = $"Không tìm thấy bài viết ID = {id}." });
            return Ok(post);
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<ActionResult<Post>> PostPost([FromBody] Post post)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPost(int id, [FromBody] Post post)
        {
            if (id != post.Id) return BadRequest(new { message = "ID không khớp." });
            _context.Entry(post).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) {
                if (!_context.Posts.Any(e => e.Id == id)) return NotFound(new { message = "Bài viết không tồn tại." });
                else throw;
            }
            return Ok(new { message = "Cập nhật thành công!", data = post });
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Bài viết không tồn tại." });
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa bài viết thành công." });
        }
    }
}
