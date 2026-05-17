/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 17/05/2026
 * Mô tả: Controller xử lý các yêu cầu liên quan đến Danh mục bài viết (Categories).
 * Chức năng: Lấy dữ liệu danh mục từ SQL Server thông qua DbContext để hiển thị lên giao diện Web.
 */

using Microsoft.AspNetCore.Mvc;
using CMS.Data;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    public class CategoryController : Controller
    {
        private readonly CMSDbContext _db;

        // Dependency Injection: Hệ thống tự động truyền CMSDbContext vào đây
        public CategoryController(CMSDbContext db)
        {
            _db = db;
        }

        // Action hiển thị danh sách các chuyên mục
        public async Task<IActionResult> Index()
        {
            // Truy vấn lấy toàn bộ dữ liệu từ bảng Categories trong SQL Server
            var data = await _db.Categories.ToListAsync();

            // Trả về View cùng với dữ liệu lấy được
            return View(data);
        }
    }
}