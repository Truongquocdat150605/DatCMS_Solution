/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Tên file: HomeController.cs
 * Mô tả: Dashboard tổng quan hệ thống CMS - Hiển thị thống kê và dữ liệu mới nhất.
 */

using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CMS.Backend.Models;
using CMS.Data;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly CMSDbContext _context;

        public HomeController(ILogger<HomeController> logger, CMSDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Thống kê số lượng tổng quan
            ViewBag.TotalProducts   = await _context.Products.CountAsync();
            ViewBag.TotalPosts      = await _context.Posts.CountAsync();
            ViewBag.TotalCustomers  = await _context.Customers.CountAsync();
            ViewBag.TotalCategories = await _context.CategoryProducts.CountAsync();
            ViewBag.TotalOrders     = await _context.Orders.CountAsync();
            ViewBag.TotalUsers      = await _context.Users.CountAsync();

            // Lấy 5 bài viết mới nhất (kèm danh mục)
            ViewBag.RecentPosts = await _context.Posts
                .Include(p => p.Category)
                .OrderByDescending(p => p.CreatedDate)
                .Take(5)
                .ToListAsync();

            // Lấy 5 sản phẩm mới nhất (kèm danh mục sản phẩm)
            ViewBag.RecentProducts = await _context.Products
                .Include(p => p.CategoryProduct)
                .OrderByDescending(p => p.Id)
                .Take(5)
                .ToListAsync();

            // Lấy 5 đơn hàng mới nhất (kèm khách hàng)
            ViewBag.RecentOrders = await _context.Orders
                .Include(o => o.Customer)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .ToListAsync();

            return View();
        }

        public IActionResult Privacy() => View();

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}