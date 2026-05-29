using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public CategoryApiController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/CategoryApi - Lấy tất cả danh mục bài viết
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.Posts) // Kèm theo danh sách bài viết
                .ToListAsync();

            if (categories == null || !categories.Any())
            {
                return NotFound(new { message = "Không tìm thấy danh mục bài viết nào trong hệ thống." });
            }

            return Ok(categories);
        }

        // 2. GET: api/CategoryApi/5 - Lấy chi tiết danh mục bài viết
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Posts)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { message = $"Không tìm thấy danh mục bài viết với ID = {id}." });
            }

            return Ok(category);
        }

        // 3. POST: api/CategoryApi - Thêm danh mục mới
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory([FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // 4. PUT: api/CategoryApi/5 - Cập nhật danh mục
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, [FromBody] Category category)
        {
            if (id != category.Id)
            {
                return BadRequest(new { message = "ID danh mục không khớp với dữ liệu truyền vào." });
            }

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound(new { message = $"Không thể cập nhật. Danh mục bài viết ID = {id} không tồn tại." });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Cập nhật danh mục bài viết thành công!", data = category });
        }

        // 5. DELETE: api/CategoryApi/5 - Xóa danh mục
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = $"Không thể xóa. Không tìm thấy danh mục bài viết ID = {id}." });
            }

            var hasPosts = await _context.Posts.AnyAsync(p => p.CategoryId == id);
            if (hasPosts)
            {
                return BadRequest(new { message = "Không thể xóa danh mục này vì vẫn còn bài viết liên kết bên trong." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa thành công danh mục bài viết ID = {id}." });
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}
