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
    [Route("api/Orders")]
    [ApiController]
    public class OrderApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public OrderApiController(CMSDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .ToListAsync();
            if (orders == null || !orders.Any())
                return NotFound(new { message = "Không tìm thấy đơn hàng nào." });
            return Ok(orders);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
                return NotFound(new { message = $"Không tìm thấy đơn hàng ID = {id}." });
            return Ok(order);
        }

        [AllowAnonymous]
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(int customerId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            if (orders == null || !orders.Any())
                return NotFound(new { message = "Không tìm thấy đơn hàng nào của khách hàng này." });

            return Ok(orders);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> PostOrder([FromBody] Order order)
        {
            if (order == null || order.OrderDetails == null || !order.OrderDetails.Any())
                return BadRequest(new { message = "Giỏ hàng rỗng hoặc dữ liệu không hợp lệ." });

            // 1. Tạo thông tin đơn hàng mặc định
            order.OrderDate = System.DateTime.Now;
            order.Status = 0; // 0 - Chờ duyệt

            // 2. Lặp qua chi tiết đơn hàng (lấy đúng giá và trừ tồn kho)
            foreach (var detail in order.OrderDetails)
            {
                var product = await _context.Products.FindAsync(detail.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Sản phẩm ID {detail.ProductId} không tồn tại." });

                if (product.StockQuantity < detail.Quantity)
                    return BadRequest(new { message = $"Sản phẩm {product.Name} không đủ tồn kho (Còn {product.StockQuantity})." });

                // Gán đúng giá hiện tại của sản phẩm từ Database
                detail.UnitPrice = product.Price;

                // Khấu trừ số lượng tồn kho
                product.StockQuantity -= detail.Quantity;
                _context.Entry(product).State = EntityState.Modified;
            }

            // 3. Lưu vào database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đặt hàng thành công", orderId = order.Id });
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, [FromBody] Order order)
        {
            if (id != order.Id) return BadRequest(new { message = "ID không khớp." });
            _context.Entry(order).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) {
                if (!_context.Orders.Any(e => e.Id == id)) return NotFound(new { message = "Đơn hàng không tồn tại." });
                else throw;
            }
            return Ok(new { message = "Cập nhật thành công!", data = order });
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại." });
            var hasDetails = await _context.OrderDetails.AnyAsync(od => od.OrderId == id);
            if (hasDetails) return BadRequest(new { message = "Không thể xóa đơn hàng đã có chi tiết sản phẩm." });
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa đơn hàng thành công." });
        }
    }
}
