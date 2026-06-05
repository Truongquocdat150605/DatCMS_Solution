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

        public OrderController(CMSDbContext context)
        {
            _context = context;
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
                _context.Update(order);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.CustomerId = new SelectList(await _context.Customers.ToListAsync(), "Id", "FullName", order.CustomerId);
            return View(order);
        }

        // ✅ CHỈ ADMIN MỚI ĐƯỢC XÓA
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