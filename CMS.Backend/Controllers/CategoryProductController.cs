using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class CategoryProductController : Controller
    {
        private readonly CMSDbContext _context;

        public CategoryProductController(CMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var categoryProducts = await _context.CategoryProducts.ToListAsync();
            return View(categoryProducts);
        }
    }
}