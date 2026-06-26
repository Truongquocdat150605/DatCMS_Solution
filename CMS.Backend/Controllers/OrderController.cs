using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")]
    public class OrderController : Controller
    {
        private readonly CMSDbContext _context;
        private readonly CMS.Backend.Services.IEmailService _emailService;

        public OrderController(CMSDbContext context, CMS.Backend.Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<IActionResult> Index(string searchString, int? status)
        {
            // Giữ lại giá trị để hiển thị trên View
            ViewBag.SearchString = searchString;
            ViewBag.StatusFilter = status;

            var orders = _context.Orders.Include(o => o.Customer).AsQueryable();

            if (!string.IsNullOrEmpty(searchString))
            {
                orders = orders.Where(o => o.Customer != null && o.Customer.FullName.Contains(searchString));
            }

            if (status.HasValue)
            {
                orders = orders.Where(o => o.Status == status.Value);
            }

            // Mặc định sắp xếp đơn hàng mới nhất lên đầu
            return View(await orders.OrderByDescending(o => o.OrderDate).ToListAsync());
        }

        [HttpGet]
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();

            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (order == null) return NotFound();

            return View(order);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewBag.CustomerId = new SelectList(await _context.Customers.ToListAsync(), "Id", "FullName");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Order order)
        {
            ModelState.Remove("Customer");
            ModelState.Remove("OrderDetails");

            if (ModelState.IsValid)
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.CustomerId = new SelectList(await _context.Customers.ToListAsync(), "Id", "FullName", order.CustomerId);
            return View(order);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            ViewBag.CustomerId = new SelectList(await _context.Customers.ToListAsync(), "Id", "FullName", order.CustomerId);
            return View(order);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Order order)
        {
            if (id != order.Id) return NotFound();

            ModelState.Remove("Customer");
            ModelState.Remove("OrderDetails");

            if (ModelState.IsValid)
            {
                // Lấy đơn hàng cũ từ DB (chưa Tracking) để so sánh trạng thái
                var oldOrder = await _context.Orders.AsNoTracking()
                                    .Include(o => o.Customer)
                                    .FirstOrDefaultAsync(o => o.Id == id);
                                    
                _context.Update(order);
                await _context.SaveChangesAsync();

                // Gửi email nếu trạng thái thay đổi
                if (oldOrder != null && oldOrder.Status != order.Status && oldOrder.Customer != null && !string.IsNullOrEmpty(oldOrder.Customer.Email))
                {
                    string statusText = order.Status == 1 ? "Đang giao hàng" : (order.Status == 2 ? "Đã giao thành công" : "Chờ duyệt");
                    string emailContent = $@"
                        <h2>Xin chào {oldOrder.Customer.FullName},</h2>
                        <p>Đơn hàng <strong>#{order.Id}</strong> của bạn vừa được cập nhật trạng thái.</p>
                        <p>Trạng thái hiện tại: <strong style='color: blue;'>{statusText}</strong></p>
                        <p>Cảm ơn bạn đã mua sắm tại CMS Store!</p>
                    ";
                    try
                    {
                        await _emailService.SendEmailAsync(oldOrder.Customer.Email, $"Cập nhật trạng thái đơn hàng #{order.Id}", emailContent);
                    }
                    catch (System.Exception ex)
                    {
                        System.Console.WriteLine("Lỗi gửi email cập nhật đơn hàng: " + ex.Message);
                    }
                }

                return RedirectToAction(nameof(Index));
            }

            ViewBag.CustomerId = new SelectList(await _context.Customers.ToListAsync(), "Id", "FullName", order.CustomerId);
            return View(order);
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Editor")]
        public async Task<IActionResult> DeleteDetail(int detailId, int orderId)
        {
            var detail = await _context.OrderDetails.FindAsync(detailId);
            if (detail != null)
            {
                _context.OrderDetails.Remove(detail);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Đã xóa 1 sản phẩm khỏi đơn hàng thành công!";
            }
            return RedirectToAction(nameof(Details), new { id = orderId });
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Editor")]
        public async Task<IActionResult> ClearAllDetails(int orderId)
        {
            var details = await _context.OrderDetails.Where(od => od.OrderId == orderId).ToListAsync();
            if (details.Any())
            {
                _context.OrderDetails.RemoveRange(details);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Đã xóa TẤT CẢ sản phẩm khỏi đơn hàng!";
            }
            return RedirectToAction(nameof(Details), new { id = orderId });
        }

        // ✅ CHỈ ADMIN MỚI ĐƯỢC XÓA ĐƠN HÀNG GỐC
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var hasOrderDetails = await _context.OrderDetails.AnyAsync(od => od.OrderId == id);
            if (hasOrderDetails)
            {
                TempData["Error"] = "Không thể xóa! Đơn hàng này đã có chi tiết đơn hàng (sản phẩm). Phải xóa chi tiết đơn hàng trước.";
                return RedirectToAction(nameof(Index));
            }

            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}