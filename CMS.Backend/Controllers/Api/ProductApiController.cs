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
    [Route("api/Products")]
    [ApiController]
    public class ProductApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public ProductApiController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/ProductApi - Lấy tất cả sản phẩm
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.CategoryProduct)
                .ToListAsync();

            if (products == null || !products.Any())
            {
                return NotFound(new { message = "Không tìm thấy danh sách sản phẩm nào trong hệ thống." });
            }

            return Ok(products);
        }

        // 2. GET: api/ProductApi/5 - Lấy chi tiết sản phẩm theo ID
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.CategoryProduct)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID = {id}." });
            }

            return Ok(product);
        }

        // 2.5 GET: api/ProductApi/category/{categoryProductId} - Lọc sản phẩm theo danh mục
        [AllowAnonymous]
        [HttpGet("category/{categoryProductId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(int categoryProductId)
        {
            var products = await _context.Products
                .Include(p => p.CategoryProduct)
                .Where(p => p.CategoryProductId == categoryProductId)
                .ToListAsync();

            if (products == null || !products.Any())
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm nào thuộc danh mục {categoryProductId}." });
            }

            return Ok(products);
        }

        // 3. POST: api/ProductApi - Thêm sản phẩm mới
        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // 4. PUT: api/ProductApi/5 - Cập nhật sản phẩm
        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] Product product)
        {
            if (id != product.Id)
            {
                return BadRequest(new { message = "ID sản phẩm không khớp với dữ liệu truyền vào." });
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound(new { message = $"Không thể cập nhật. Sản phẩm với ID = {id} không tồn tại." });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Cập nhật sản phẩm thành công!", data = product });
        }

        // 5. DELETE: api/ProductApi/5 - Xóa sản phẩm
        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = $"Không thể xóa. Không tìm thấy sản phẩm với ID = {id}." });
            }

            // Kiểm tra ràng buộc khóa ngoại nếu cần (ví dụ: OrderDetail)
            var hasOrderDetails = await _context.OrderDetails.AnyAsync(od => od.ProductId == id);
            if (hasOrderDetails)
            {
                return BadRequest(new { message = "Không thể xóa sản phẩm này vì đã có đơn hàng liên kết." });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa thành công sản phẩm ID = {id}." });
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}
