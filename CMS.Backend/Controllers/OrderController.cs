using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    public class OrderController : Controller
    {
        private readonly CMSDbContext _context;

        public OrderController(CMSDbContext context)
        {
            _context = context;
        }

        // GET: Order/Index
        public async Task<IActionResult> Index()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .ToListAsync();
            return View(orders);
        }

        // GET: Order/Create
        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewBag.CustomerId = new SelectList(await _context.Customers.ToListAsync(), "Id", "FullName");
            return View();
        }

        // POST: Order/Create
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

        // GET: Order/Edit
        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            ViewBag.CustomerId = new SelectList(await _context.Customers.ToListAsync(), "Id", "FullName", order.CustomerId);
            return View(order);
        }

        // POST: Order/Edit
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

        // GET: Order/Delete
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