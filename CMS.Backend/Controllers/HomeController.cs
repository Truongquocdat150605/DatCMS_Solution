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
using System.Text.Json;

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
            // ========== THỐNG KÊ SỐ LƯỢNG CƠ BẢN ==========
            ViewBag.TotalProducts = await _context.Products.CountAsync();
            ViewBag.TotalPosts = await _context.Posts.CountAsync();
            ViewBag.TotalCustomers = await _context.Customers.CountAsync();
            ViewBag.TotalCategories = await _context.CategoryProducts.CountAsync();
            ViewBag.TotalOrders = await _context.Orders.CountAsync();
            ViewBag.TotalUsers = await _context.Users.CountAsync();

            // ========== THỐNG KÊ DOANH THU ==========
            var today = DateTime.Today;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // Doanh thu hôm nay
            var todayRevenue = await _context.OrderDetails
                .Where(od => od.Order.Status == 2 && od.Order.OrderDate.Date == today)
                .SumAsync(od => od.Quantity * od.UnitPrice);
            ViewBag.TodayRevenue = todayRevenue;

            // Doanh thu tháng này
            var monthRevenue = await _context.OrderDetails
                .Where(od => od.Order.Status == 2 && od.Order.OrderDate >= startOfMonth)
                .SumAsync(od => od.Quantity * od.UnitPrice);
            ViewBag.MonthRevenue = monthRevenue;

            // ========== THỐNG KÊ ĐƠN HÀNG ==========
            ViewBag.PendingOrders = await _context.Orders.CountAsync(o => o.Status == 0);
            ViewBag.ShippingOrders = await _context.Orders.CountAsync(o => o.Status == 1);
            ViewBag.CompletedOrders = await _context.Orders.CountAsync(o => o.Status == 2);
            ViewBag.LowStockProducts = await _context.Products.CountAsync(p => p.StockQuantity < 5);

            // ========== DỮ LIỆU BIỂU ĐỒ 7 NGÀY ==========
            var labels = new List<string>();
            var revenues = new List<decimal>();
            for (int i = 6; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                labels.Add(date.ToString("dd/MM"));
                var revenue = await _context.OrderDetails
                    .Where(od => od.Order.Status == 2 && od.Order.OrderDate.Date == date)
                    .SumAsync(od => od.Quantity * od.UnitPrice);
                revenues.Add(revenue);
            }
            ViewBag.Last7DaysLabels = JsonSerializer.Serialize(labels);
            ViewBag.Last7DaysRevenue = JsonSerializer.Serialize(revenues);

            // ========== DỮ LIỆU BIỂU ĐỒ TRẠNG THÁI ==========
            ViewBag.OrderStatusCounts = JsonSerializer.Serialize(new[] {
        await _context.Orders.CountAsync(o => o.Status == 0),
        await _context.Orders.CountAsync(o => o.Status == 1),
        await _context.Orders.CountAsync(o => o.Status == 2)
    });

            // ========== DỮ LIỆU HIỂN THỊ BẢNG ==========
            ViewBag.RecentPosts = await _context.Posts
                .Include(p => p.Category)
                .OrderByDescending(p => p.CreatedDate)
                .Take(5)
                .ToListAsync();

            ViewBag.RecentProducts = await _context.Products
                .Include(p => p.CategoryProduct)
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .ToListAsync();

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