/* * Người thực hiện: Trương Quốc Đạt - 2123110209
 * Tên file: AccountController.cs
 * Mô tả: Xử lý đăng nhập và phân quyền cho Buổi 05.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using CMS.Data;
using CMS.Data.Entities; // Đảm bảo đúng namespace thực thể của Đạt
using Microsoft.Extensions.Caching.Memory;
using CMS.Backend.Services;
using CMS.Backend.Helpers;

namespace CMS.Backend.Controllers
{
    public class AccountController : Controller
    {
        private readonly CMSDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;

        public class ResetOtpRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        public class ResetPasswordRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        public AccountController(CMSDbContext context, IMemoryCache cache, IEmailService emailService)
        {
            _context = context;
            _cache = cache;
            _emailService = emailService;
        }

        private static bool PasswordMatches(string rawPassword, string storedPassword)
        {
            return storedPassword == rawPassword || PasswordHelper.VerifyPassword(rawPassword, storedPassword);
        }

        // 1. HIỂN THỊ FORM ĐĂNG NHẬP
        [HttpGet]
        public async Task<IActionResult> Login()
        {
            if (User.Identity.IsAuthenticated)
            {
                var role = User.FindFirstValue(ClaimTypes.Role)?.Trim() ?? string.Empty;
                if (role.Equals("Admin", System.StringComparison.OrdinalIgnoreCase) ||
                    role.Equals("Editor", System.StringComparison.OrdinalIgnoreCase))
                {
                    return RedirectToAction("Index", "Home");
                }

                // Nếu đang cầm thẻ Khách hàng/sai quyền, huỷ thẻ đó
                // rồi Redirect lại để trình duyệt tải trang mới với Anti-Forgery Token mới
                await HttpContext.SignOutAsync("CookieAuth");
                return RedirectToAction("Login");
            }

            return View();
        }

        // 2. XỬ LÝ LOGIC ĐĂNG NHẬP
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string username, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);

            if (user != null && PasswordMatches(password, user.PasswordHash))
            {
                var role = user.Role?.Trim() ?? string.Empty;

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, role), // Phân quyền linh động từ DB
                    new Claim("FullName", user.FullName ?? ""),
                    new Claim("MSSV", "2123110209")
                };

                var claimsIdentity = new ClaimsIdentity(claims, "CookieAuth");

                await HttpContext.SignInAsync("CookieAuth", new ClaimsPrincipal(claimsIdentity));

                // Nếu không phải Admin hoặc Editor, đẩy về trang người dùng (Frontend)
                if (!role.Equals("Admin", System.StringComparison.OrdinalIgnoreCase) &&
                    !role.Equals("Editor", System.StringComparison.OrdinalIgnoreCase))
                {
                    return Redirect("http://localhost:3000");
                }

                // Nếu là Admin/Editor thì cho vào trang quản trị (Dashboard)
                return RedirectToAction("Index", "Home");
            }

            ViewBag.Error = "Sai tài khoản hoặc mật khẩu rồi Đạt ơi!";
            return View();
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> SendResetOtp([FromBody] ResetOtpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email))
            {
                return Json(new { success = false, message = "Vui lòng nhập đầy đủ tên đăng nhập và email." });
            }

            var user = _context.Users.FirstOrDefault(u =>
                u.Username == request.Username &&
                u.Email == request.Email &&
                (u.Role == "Admin" || u.Role == "Editor"));

            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy tài khoản quản trị phù hợp." });
            }

            var otp = new System.Random().Next(100000, 999999).ToString();
            _cache.Set($"ADMIN_RESET_{request.Username}", otp, new MemoryCacheEntryOptions().SetAbsoluteExpiration(System.TimeSpan.FromMinutes(5)));

            var subject = "Mã OTP đổi mật khẩu Admin - CMS";
            var body = $@"<h3>Xin chào {user.FullName},</h3>
                          <p>Mã OTP đổi mật khẩu của bạn là: <strong style='color:red;font-size:20px;'>{otp}</strong></p>
                          <p>Mã này có hiệu lực trong 5 phút.</p>";

            try
            {
                await _emailService.SendEmailAsync(request.Email, subject, body);
                return Json(new { success = true, message = "Đã gửi OTP đến email quản trị." });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = "Không gửi được email: " + ex.Message });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Otp) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return Json(new { success = false, message = "Vui lòng nhập đầy đủ thông tin." });
            }

            if (!_cache.TryGetValue($"ADMIN_RESET_{request.Username}", out string? savedOtp) || savedOtp != request.Otp)
            {
                return Json(new { success = false, message = "OTP không hợp lệ hoặc đã hết hạn." });
            }

            var user = _context.Users.FirstOrDefault(u =>
                u.Username == request.Username &&
                u.Email == request.Email &&
                (u.Role == "Admin" || u.Role == "Editor"));

            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy tài khoản quản trị phù hợp." });
            }

            user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            _cache.Remove($"ADMIN_RESET_{request.Username}");

            return Json(new { success = true, message = "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
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
