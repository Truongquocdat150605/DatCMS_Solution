using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using CMS.Backend.Services;
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
        private readonly IEmailService _emailService;

        public OrderApiController(CMSDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
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

            // Trả về mảng rỗng thay vì 404
            return Ok(orders ?? new List<Order>());
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> PostOrder([FromBody] CreateOrderRequest request)
        {
            if (request == null || request.OrderDetails == null || !request.OrderDetails.Any())
                return BadRequest(new { message = "Giỏ hàng rỗng hoặc dữ liệu không hợp lệ." });

            // Bắt đầu EF Core Transaction để đảm bảo tính toàn vẹn dữ liệu (Data Consistency)
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = new Order
                {
                    CustomerId = request.CustomerId,
                    Notes = request.Notes,
                    PaymentMethod = request.PaymentMethod ?? "COD",
                    PaymentStatus = request.PaymentMethod?.ToUpper() == "COD" ? "Pending" : "WaitingPayment",
                    OrderDate = System.DateTime.Now,
                    Status = 0
                };

                order.OrderDetails = new List<OrderDetail>();

                foreach (var d in request.OrderDetails)
                {
                    // Lấy sản phẩm hiện tại trong DB
                    var product = await _context.Products.FindAsync(d.ProductId);
                    if (product == null)
                        return BadRequest(new { message = $"Sản phẩm ID {d.ProductId} không tồn tại." });

                    // Kiểm tra số lượng tồn kho (StockQuantity)
                    if (product.StockQuantity < d.Quantity)
                        return BadRequest(new { message = $"Sản phẩm {product.Name} không đủ tồn kho (Còn {product.StockQuantity})." });

                    // Tạo chi tiết đơn hàng
                    order.OrderDetails.Add(new OrderDetail
                    {
                        ProductId = d.ProductId,
                        Quantity = d.Quantity,
                        UnitPrice = product.Price,
                        Product = product // Gán thẳng object Product để phía dưới lấy được Tên SP cho Email
                    });

                    // Trừ tồn kho
                    product.StockQuantity -= d.Quantity;
                    _context.Entry(product).State = EntityState.Modified;
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Nếu mọi thứ OK thì Commit Transaction
                await transaction.CommitAsync();

                // => Bắt đầu gửi Email Tự Động <=
                try
                {
                    // Chỉ gửi email lập tức nếu là COD. Nếu là thanh toán online, Webhook sẽ gửi sau (hoặc bỏ qua trong phạm vi dự án này)
                    if (order.PaymentMethod == "COD")
                    {
                        // Lấy thông tin Customer để lấy Email
                        var customer = await _context.Customers.FindAsync(request.CustomerId);
                        if (customer != null && !string.IsNullOrEmpty(customer.Email))
                    {
                        string emailContent = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                            <div style='background-color: #007bff; color: white; padding: 20px; text-align: center;'>
                                <h1 style='margin: 0;'>CMS STORE</h1>
                                <p style='margin: 5px 0 0; font-size: 16px;'>Xác nhận đơn hàng thành công!</p>
                            </div>
                            <div style='padding: 20px; background-color: #f9f9f9;'>
                                <h2 style='color: #333;'>Kính chào {customer.FullName},</h2>
                                <p style='color: #555; line-height: 1.5;'>Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>CMS Store</strong>. Đơn hàng của bạn đã được hệ thống ghi nhận và đang trong quá trình xử lý.</p>
                                
                                <div style='background-color: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin-top: 20px;'>
                                    <h3 style='margin-top: 0; color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; display: inline-block;'>Thông tin đơn hàng #{order.Id}</h3>
                                    <p><strong>Ngày đặt:</strong> {order.OrderDate.ToString("dd/MM/yyyy HH:mm")}</p>
                                    <p><strong>Thanh toán:</strong> {order.PaymentMethod}</p>
                                    <p><strong>Giao đến:</strong> {order.Notes}</p>
                                </div>

                                <table style='width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff;'>
                                    <thead>
                                        <tr style='background-color: #007bff; color: white;'>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Sản phẩm</th>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>SL</th>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Đơn giá</th>
                                            <th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>";
                        
                        decimal total = 0;
                        foreach(var detail in order.OrderDetails)
                        {
                            decimal lineTotal = detail.Quantity * detail.UnitPrice;
                            // Lấy tên sản phẩm nếu có, nếu không lấy ID
                            string productName = detail.Product != null ? detail.Product.Name : $"Mã SP: {detail.ProductId}";
                            
                            emailContent += $@"
                                        <tr>
                                            <td style='padding: 10px; border: 1px solid #ddd; color: #333;'>{productName}</td>
                                            <td style='padding: 10px; border: 1px solid #ddd; text-align: center; color: #333;'>{detail.Quantity}</td>
                                            <td style='padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;'>{detail.UnitPrice:N0}đ</td>
                                            <td style='padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #333;'>{lineTotal:N0}đ</td>
                                        </tr>";
                            total += lineTotal;
                        }

                        emailContent += $@"
                                    </tbody>
                                    <tfoot>
                                        <tr style='background-color: #fff3cd;'>
                                            <td colspan='3' style='padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 16px; color: #856404;'>Tổng thanh toán:</td>
                                            <td style='padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 16px; color: #d32f2f;'>{total:N0} VNĐ</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                
                                <p style='margin-top: 20px; color: #555; line-height: 1.5;'>Nhân viên của chúng tôi sẽ sớm liên hệ với bạn để xác nhận thời gian giao hàng. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ Hotline: <strong>1900 xxxx</strong>.</p>
                                <p style='color: #777; font-size: 13px; text-align: center; margin-top: 30px;'>Trân trọng,<br><strong>Đội ngũ CMS Store</strong></p>
                            </div>
                        </div>";

                        await _emailService.SendEmailAsync(customer.Email, $"Xác nhận đơn hàng #{order.Id} từ CMS Store", emailContent);
                    }
                }
                }
                catch (System.Exception ex)
                {
                    // Log lỗi gửi mail nhưng KHÔNG rollback đơn hàng vì đơn hàng đã thành công
                    System.Console.WriteLine("Lỗi gửi Email: " + ex.Message);
                }

                return Ok(new { success = true, message = "Tạo đơn hàng thành công", orderId = order.Id });
            }
            catch (System.Exception ex)
            {
                // Nếu có lỗi (Exception) thì Rollback toàn bộ thay đổi (không trừ tồn kho, không tạo đơn)
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống khi đặt hàng. Chi tiết: " + ex.Message });
            }
        }

        public class CreateOrderRequest
        {
            public int CustomerId { get; set; }
            public string? Notes { get; set; }
            public string? PaymentMethod { get; set; } // COD, PayOS, Stripe
            public List<OrderDetailRequest> OrderDetails { get; set; } = new();
        }

        public class OrderDetailRequest
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
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

        [AllowAnonymous]
        [HttpPost("{id}/cancel-unpaid")]
        public async Task<IActionResult> CancelUnpaidOrder(int id)
        {
            var order = await _context.Orders.Include(o => o.OrderDetails).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng." });

            if (order.PaymentStatus == "Paid" || order.Status != 0)
                return BadRequest(new { message = "Không thể hủy đơn hàng đã thanh toán hoặc đã xử lý." });

            // Trả lại tồn kho
            foreach (var detail in order.OrderDetails)
            {
                var product = await _context.Products.FindAsync(detail.ProductId);
                if (product != null)
                {
                    product.StockQuantity += detail.Quantity;
                    _context.Entry(product).State = EntityState.Modified;
                }
            }

            // Xóa OrderDetails trước
            _context.OrderDetails.RemoveRange(order.OrderDetails);
            
            // Xóa Order
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã hủy đơn hàng và hoàn lại tồn kho." });
        }
    }
}
