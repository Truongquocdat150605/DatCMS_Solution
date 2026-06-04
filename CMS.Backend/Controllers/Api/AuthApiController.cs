using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/Auth")]
    [ApiController]
    public class AuthApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public AuthApiController(CMSDbContext context)
        {
            _context = context;
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

        // POST: api/AuthApi/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u =>
                u.Username == request.Username && u.PasswordHash == request.Password);

            if (user == null)
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
                Password = request.Password, // Lưu thô theo yêu cầu
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
            var customer = _context.Customers.FirstOrDefault(c => c.Email == request.Email && c.Password == request.Password);
            
            if (customer == null)
                return Unauthorized(new { message = "Sai email hoặc mật khẩu." });

            return Ok(new
            {
                success = true,
                customerId = customer.Id,
                email = customer.Email,
                fullName = customer.FullName
            });
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
    }
}
