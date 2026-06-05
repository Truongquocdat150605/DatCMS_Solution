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
    public class OrderDetailController : Controller
    {
        private readonly CMSDbContext _context;

        public OrderDetailController(CMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(int? orderId, string productName)
        {
            ViewBag.OrderIdFilter = orderId;
            ViewBag.ProductNameSearch = productName;

            var orderDetails = _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .AsQueryable();

            if (orderId.HasValue)
            {
                orderDetails = orderDetails.Where(od => od.OrderId == orderId.Value);
            }

            if (!string.IsNullOrEmpty(productName))
            {
                orderDetails = orderDetails.Where(od => od.Product != null && od.Product.Name.Contains(productName));
            }

            return View(await orderDetails.OrderByDescending(od => od.Id).ToListAsync());
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewBag.OrderId = new SelectList(await _context.Orders.ToListAsync(), "Id", "Id");
            ViewBag.ProductId = new SelectList(await _context.Products.ToListAsync(), "Id", "Name");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(OrderDetail orderDetail)
        {
            ModelState.Remove("Order");
            ModelState.Remove("Product");

            if (ModelState.IsValid)
            {
                _context.OrderDetails.Add(orderDetail);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.OrderId = new SelectList(await _context.Orders.ToListAsync(), "Id", "Id", orderDetail.OrderId);
            ViewBag.ProductId = new SelectList(await _context.Products.ToListAsync(), "Id", "Name", orderDetail.ProductId);
            return View(orderDetail);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail == null) return NotFound();

            ViewBag.OrderId = new SelectList(await _context.Orders.ToListAsync(), "Id", "Id", orderDetail.OrderId);
            ViewBag.ProductId = new SelectList(await _context.Products.ToListAsync(), "Id", "Name", orderDetail.ProductId);
            return View(orderDetail);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, OrderDetail orderDetail)
        {
            if (id != orderDetail.Id) return NotFound();

            ModelState.Remove("Order");
            ModelState.Remove("Product");

            if (ModelState.IsValid)
            {
                _context.Update(orderDetail);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.OrderId = new SelectList(await _context.Orders.ToListAsync(), "Id", "Id", orderDetail.OrderId);
            ViewBag.ProductId = new SelectList(await _context.Products.ToListAsync(), "Id", "Name", orderDetail.ProductId);
            return View(orderDetail);
        }

        // ✅ CHỈ ADMIN MỚI ĐƯỢC XÓA
        // GET: OrderDetail/Delete/5
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail != null)
            {
                _context.OrderDetails.Remove(orderDetail);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}