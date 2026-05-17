using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class CustomerController : Controller
    {
        private readonly CMSDbContext _context;

        public CustomerController(CMSDbContext context)
        {
            _context = context;
        }

        // GET: Customer/Index
        public async Task<IActionResult> Index()
        {
            var customers = await _context.Customers.ToListAsync();
            return View(customers);
        }
    }
}