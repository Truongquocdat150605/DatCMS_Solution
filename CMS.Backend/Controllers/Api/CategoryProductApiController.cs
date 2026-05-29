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
    public class CategoryProductApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public CategoryProductApiController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/CategoryProductApi - Lấy tất cả danh mục
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryProduct>>> GetCategories()
        {
            var categories = await _context.CategoryProducts
                .Include(c => c.Products) // Bao gồm cả danh sách sản phẩm thuộc danh mục
                .ToListAsync();

            if (categories == null || !categories.Any())
            {
                return NotFound(new { message = "Không tìm thấy danh mục sản phẩm nào." });
            }

            return Ok(categories);
        }

        // 2. GET: api/CategoryProductApi/5 - Lấy chi tiết danh mục theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryProduct>> GetCategory(int id)
        {
            var category = await _context.CategoryProducts
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { message = $"Không tìm thấy danh mục với ID = {id}." });
            }

            return Ok(category);
        }

        // 3. POST: api/CategoryProductApi - Thêm danh mục mới
        [HttpPost]
        public async Task<ActionResult<CategoryProduct>> PostCategory([FromBody] CategoryProduct categoryProduct)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.CategoryProducts.Add(categoryProduct);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = categoryProduct.Id }, categoryProduct);
        }

        // 4. PUT: api/CategoryProductApi/5 - Cập nhật danh mục
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, [FromBody] CategoryProduct categoryProduct)
        {
            if (id != categoryProduct.Id)
            {
                return BadRequest(new { message = "ID danh mục không khớp với dữ liệu truyền vào." });
            }

            _context.Entry(categoryProduct).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound(new { message = $"Không thể cập nhật. Danh mục ID = {id} không tồn tại." });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Cập nhật danh mục thành công!", data = categoryProduct });
        }

        // 5. DELETE: api/CategoryProductApi/5 - Xóa danh mục
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.CategoryProducts.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = $"Không thể xóa. Không tìm thấy danh mục ID = {id}." });
            }

            // Kiểm tra xem danh mục có chứa sản phẩm không
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryProductId == id);
            if (hasProducts)
            {
                return BadRequest(new { message = "Không thể xóa danh mục này vì vẫn còn sản phẩm liên kết bên trong." });
            }

            _context.CategoryProducts.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa thành công danh mục ID = {id}." });
        }

        private bool CategoryExists(int id)
        {
            return _context.CategoryProducts.Any(e => e.Id == id);
        }
    }
}
