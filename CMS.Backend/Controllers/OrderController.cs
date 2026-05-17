using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

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
                .Include(o => o.Customer)  // Lấy thông tin khách hàng
                .ToListAsync();
            return View(orders);
        }
    }
}