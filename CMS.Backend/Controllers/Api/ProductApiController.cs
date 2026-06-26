using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System;
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

        // 1. GET: api/Products - Lấy danh sách sản phẩm (Có hỗ trợ tìm kiếm và phân trang cho Swagger)
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] string? search, [FromQuery] int? categoryId, [FromQuery] int? page, [FromQuery] int? pageSize)
        {
            var query = _context.Products.Include(p => p.CategoryProduct).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryProductId == categoryId.Value);
            }

            if (page.HasValue && pageSize.HasValue && page.Value > 0 && pageSize.Value > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var products = await query.ToListAsync();

            if (products == null || !products.Any())
            {
                return NotFound(new { message = "Không tìm thấy danh sách sản phẩm nào trong hệ thống." });
            }

            return Ok(products);
        }

        // 2. GET: api/Products/5 - Lấy chi tiết sản phẩm theo ID
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

        // 2.5 GET: api/Products/category/{categoryProductId} - Lọc sản phẩm theo danh mục
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

        // 3. POST: api/Products - Thêm sản phẩm mới
        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (product.CreatedAt == default)
            {
                product.CreatedAt = DateTime.UtcNow;
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // 4. PUT: api/Products/5 - Cập nhật sản phẩm
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

        // 5. DELETE: api/Products/5 - Xóa sản phẩm
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

        // 6. GET: api/Products/latest - Lấy 3 sản phẩm mới nhất (theo Id giảm dần)
        [AllowAnonymous]
        [HttpGet("latest")]
        public async Task<ActionResult<IEnumerable<object>>> GetLatestProducts()
        {
            // Sắp xếp giảm dần theo Id (được seed vào sau có Id lớn hơn) => sản phẩm mới nhất
            var products = await _context.Products
                .Include(p => p.CategoryProduct)
                .AsNoTracking()
                .OrderByDescending(p => p.CreatedAt)
                .ThenByDescending(p => p.Id)
                .Take(3) // Chỉ lấy 3 sản phẩm
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl,
                    p.StockQuantity,
                    CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : ""
                })
                .ToListAsync();

            return Ok(products);
        }

        // 7. GET: api/Products/best-selling - Lấy 3 sản phẩm bán chạy nhất từ bảng OrderDetail
        [AllowAnonymous]
        [HttpGet("best-selling")]
        public async Task<ActionResult<IEnumerable<object>>> GetBestSellingProducts()
        {
            // Join OrderDetails với Products, GroupBy ProductId, tính tổng số lượng bán ra
            var bestSelling = await _context.OrderDetails
                .AsNoTracking()
                .Where(od => od.Order != null && od.Order.Status == 2)
                .GroupBy(od => od.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    TotalSold = g.Sum(od => od.Quantity) // Tổng số lượng đã bán
                })
                .OrderByDescending(x => x.TotalSold) // Sắp theo bán chạy nhất
                .Take(3)
                .Join(
                    _context.Products.AsNoTracking().Include(p => p.CategoryProduct),
                    g => g.ProductId,
                    p => p.Id,
                    (g, p) => new
                    {
                        p.Id,
                        p.Name,
                        p.Price,
                        p.ImageUrl,
                        p.StockQuantity,
                        CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : "",
                        TotalSold = g.TotalSold // Số lượng đã bán được
                    }
                )
                .ToListAsync();

            // Nếu chưa có đơn hàng nào, fallback về 3 sản phẩm đầu tiên
            if (!bestSelling.Any())
            {
                var fallback = await _context.Products
                    .AsNoTracking()
                    .Include(p => p.CategoryProduct)
                    .Take(3)
                    .Select(p => new
                    {
                        p.Id, p.Name, p.Price, p.ImageUrl, p.StockQuantity,
                        CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : "",
                        TotalSold = 0
                    })
                    .ToListAsync();
                return Ok(fallback);
            }

            return Ok(bestSelling);
        }
    }
}
