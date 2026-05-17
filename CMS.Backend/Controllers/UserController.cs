/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 17/05/2026
 * Mô tả: Controller quản lý người dùng  (user  ) - Bài tập rèn luyện Buổi 02.
 * Chức năng: Thực hiện Dependency Injection và lấy danh sách người dùng từ SQL.
 */


using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    public class UserController : Controller
    {
        private readonly CMSDbContext _context;

        public UserController(CMSDbContext context)
        {
            _context = context;
        }

        // GET: User/Index
        public async Task<IActionResult> Index()
        {
            var users = await _context.Users.ToListAsync();
            return View(users);
        }
    }
}