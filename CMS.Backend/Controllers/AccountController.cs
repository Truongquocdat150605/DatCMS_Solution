/* * Người thực hiện: Trương Quốc Đạt - 2123110209
 * Tên file: AccountController.cs
 * Mô tả: Xử lý đăng nhập và phân quyền cho Buổi 05.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using CMS.Data;
using CMS.Data.Entities; // Đảm bảo đúng namespace thực thể của Đạt

namespace CMS.Backend.Controllers
{
    public class AccountController : Controller
    {
        private readonly CMSDbContext _context;

        public AccountController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. HIỂN THỊ FORM ĐĂNG NHẬP
        [HttpGet]
        public IActionResult Login()
        {
            // Nếu đã đăng nhập rồi thì đá sang trang chủ luôn
            if (User.Identity.IsAuthenticated) return RedirectToAction("Index", "Home");
            return View();
        }

        // 2. XỬ LÝ LOGIC ĐĂNG NHẬP
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string username, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username && u.PasswordHash == password);

            if (user != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role), // Phân quyền linh động từ DB
                    new Claim("FullName", user.FullName ?? ""),
                    new Claim("MSSV", "2123110209")
                };

                var claimsIdentity = new ClaimsIdentity(claims, "CookieAuth");

                await HttpContext.SignInAsync("CookieAuth", new ClaimsPrincipal(claimsIdentity));

                return RedirectToAction("Index", "Home");
            }

            ViewBag.Error = "Sai tài khoản hoặc mật khẩu rồi Đạt ơi!";
            return View();
        }

        // 3. ĐĂNG XUẤT
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("CookieAuth");
            return RedirectToAction("Login");
        }

        // 4. TRANG BÁO LỖI QUYỀN TRUY CẬP
        public IActionResult AccessDenied()
        {
            TempData["Error"] = "Đạt ơi, m chưa có quyền Admin để vào đây đâu!";
            return View();
        }
    }
}