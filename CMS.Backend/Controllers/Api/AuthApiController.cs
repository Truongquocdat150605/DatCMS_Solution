using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;

using Microsoft.Extensions.Caching.Memory;
using CMS.Backend.Services;
using CMS.Backend.Helpers;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/Auth")]
    [ApiController]
    public class AuthApiController : ControllerBase
    {
        private readonly CMSDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;

        public AuthApiController(CMSDbContext context, IMemoryCache cache, IEmailService emailService)
        {
            _context = context;
            _cache = cache;
            _emailService = emailService;
        }

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class CustomerRegisterRequest
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
        }

        public class CustomerLoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class ChangePasswordRequest
        {
            public string Email { get; set; } = string.Empty;
            public string CurrentPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        public class UpdateCustomerProfileRequest
        {
            public int CustomerId { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
        }

        public class UpdateUserProfileRequest
        {
            public int UserId { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        private static bool PasswordMatches(string rawPassword, string storedPassword)
        {
            return storedPassword == rawPassword || PasswordHelper.VerifyPassword(rawPassword, storedPassword);
        }

        // POST: api/AuthApi/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);

            if (user == null || !PasswordMatches(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu." });

            var role = (user.Role ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(role)) role = "User";

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, role),
                new Claim("FullName", user.FullName ?? "")
            };

            var claimsIdentity = new ClaimsIdentity(claims, "CookieAuth");

            await HttpContext.SignInAsync(
                "CookieAuth",
                new ClaimsPrincipal(claimsIdentity));

            var redirectUrl = (role.Equals("Admin", System.StringComparison.OrdinalIgnoreCase) ||
                                role.Equals("Editor", System.StringComparison.OrdinalIgnoreCase))
                ? "/Home/Index"
                : "/";

            return Ok(new
            {
                success = true,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    fullName = user.FullName,
                    role = role
                },
                redirectUrl
            });
        }

        // POST: api/AuthApi/CustomerRegister
        [AllowAnonymous]
        [HttpPost("CustomerRegister")]
        public async Task<IActionResult> CustomerRegister([FromBody] CustomerRegisterRequest request)
        {
            if (_context.Customers.Any(c => c.Email == request.Email))
                return BadRequest(new { message = "Email này đã được sử dụng." });

            var customer = new Customer
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = PasswordHelper.HashPassword(request.Password),
                Phone = request.Phone,
                Address = request.Address
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đăng ký thành công!", customerId = customer.Id });
        }


        // POST: api/AuthApi/CustomerLogin
        [AllowAnonymous]
        [HttpPost("CustomerLogin")]
        public async Task<IActionResult> CustomerLogin([FromBody] CustomerLoginRequest request)
        {
            var customer = _context.Customers.FirstOrDefault(c => c.Email == request.Email);

            if (customer == null || !PasswordHelper.VerifyPassword(request.Password, customer.Password))
                return Unauthorized(new { message = "Sai email hoặc mật khẩu." });

            return Ok(new
            {
                success = true,
                customerId = customer.Id,
                email = customer.Email,
                fullName = customer.FullName
            });
        }

        // POST: api/Auth/change-password
        [AllowAnonymous]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Thiếu thông tin đổi mật khẩu." });
            }

            var customer = _context.Customers.FirstOrDefault(c => c.Email == request.Email);

            if (customer == null || !PasswordHelper.VerifyPassword(request.CurrentPassword, customer.Password))
                return Unauthorized(new { message = "Email hoặc mật khẩu hiện tại không đúng." });

            customer.Password = PasswordHelper.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đổi mật khẩu thành công." });
        }


        // POST: api/AuthApi/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("CookieAuth");
            return Ok(new { success = true, redirectUrl = "/login" });
        }

        // GET: api/AuthApi/me
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "Không xác định được người dùng." });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "Người dùng không tồn tại." });

            return Ok(new
            {
                user.Id,
                user.Username,
                user.FullName,
                user.Role
            });
        }

        public class OtpRequest
        {
            public string Email { get; set; } = string.Empty;
        }

        public class VerifyOtpRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
        }

        // POST: api/Auth/send-otp
        [AllowAnonymous]
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
            var customerExists = _context.Customers.Any(c => c.Email == request.Email);
            if (!customerExists)
                return BadRequest(new { message = "Email này chưa được đăng ký trong hệ thống." });

            string otpCode = new System.Random().Next(100000, 999999).ToString();

            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(System.TimeSpan.FromMinutes(5));
            _cache.Set($"OTP_{request.Email}", otpCode, cacheOptions);

            string subject = "Mã xác thực OTP - CMS PC Store";
            string body = $"<h3>Xin chào,</h3><p>Mã xác thực OTP của bạn là: <strong style='color:red; font-size: 20px;'>{otpCode}</strong></p><p>Mã này sẽ hết hạn trong vòng 5 phút. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>";
            
            try
            {
                await _emailService.SendEmailAsync(request.Email, subject, body);
                return Ok(new { success = true, message = "Đã gửi mã OTP đến email của bạn." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi gửi email: " + ex.Message });
            }
        }

        // POST: api/Auth/reset-password
        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Otp) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Thiếu thông tin đặt lại mật khẩu." });
            }

            if (!_cache.TryGetValue($"OTP_{request.Email}", out string? savedOtp) || savedOtp != request.Otp)
                return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });

            var customer = _context.Customers.FirstOrDefault(c => c.Email == request.Email);
            if (customer == null)
                return NotFound(new { message = "Không tìm thấy khách hàng." });

            customer.Password = request.NewPassword;
            await _context.SaveChangesAsync();

            _cache.Remove($"OTP_{request.Email}");

            return Ok(new { success = true, message = "Đặt lại mật khẩu thành công." });
        }

        // POST: api/Auth/verify-otp
        [AllowAnonymous]
        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            if (_cache.TryGetValue($"OTP_{request.Email}", out string? savedOtp))
            {
                if (savedOtp == request.Otp)
                {
                    _cache.Remove($"OTP_{request.Email}");
                    return Ok(new { success = true, message = "Xác thực OTP thành công." });
                }
            }
            return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });
        }
        [AllowAnonymous]
        [HttpGet("customer-profile")]
        public async Task<IActionResult> GetCustomerProfile(int customerId)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                return NotFound();

            return Ok(new
            {
                customer.Id,
                customer.FullName,
                customer.Email,
                customer.Phone,
                customer.Address,
                CreatedAt = DateTime.Now
            });
        }

        [AllowAnonymous]
        [HttpPut("update-customer-profile")]
        public async Task<IActionResult> UpdateCustomerProfile([FromBody] UpdateCustomerProfileRequest request)
        {
            var customer = await _context.Customers.FindAsync(request.CustomerId);
            if (customer == null)
                return NotFound(new { message = "Không tìm thấy khách hàng." });

            customer.FullName = request.FullName;
            customer.Email = request.Email;
            customer.Phone = request.Phone;
            customer.Address = request.Address;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cập nhật hồ sơ thành công.", data = customer });
        }

        [AllowAnonymous]
        [HttpPut("update-user-profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserProfileRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy quản trị viên." });

            user.FullName = request.FullName;
            user.Email = request.Email;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cập nhật hồ sơ thành công.", data = new { user.Id, user.Username, user.FullName, user.Email, user.Role } });
        }
    }
}
