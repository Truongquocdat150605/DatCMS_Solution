using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    public class OrderDetailController : Controller
    {
        private readonly CMSDbContext _context;

        public OrderDetailController(CMSDbContext context)
        {
            _context = context;
        }

        // GET: OrderDetail/Index
        public async Task<IActionResult> Index()
        {
            var orderDetails = await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .ToListAsync();
            return View(orderDetails);
        }

        // GET: OrderDetail/Create
        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewBag.OrderId = new SelectList(await _context.Orders.ToListAsync(), "Id", "Id");
            ViewBag.ProductId = new SelectList(await _context.Products.ToListAsync(), "Id", "Name");
            return View();
        }

        // POST: OrderDetail/Create
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

        // GET: OrderDetail/Edit
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

        // POST: OrderDetail/Edit
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

        // GET: OrderDetail/Delete
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
