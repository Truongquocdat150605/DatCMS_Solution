using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class ProductController : Controller
    {
        private readonly CMSDbContext _context;

        public ProductController(CMSDbContext context)
        {
            _context = context;
        }

        // GET: Product/Index
        public async Task<IActionResult> Index()
        {
            var products = await _context.Products
                .Include(p => p.CategoryProduct)  // Lấy luôn thông tin danh mục
                .ToListAsync();
            return View(products);
        }
    }
}