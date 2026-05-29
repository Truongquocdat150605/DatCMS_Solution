/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 22/05/2026
 * Tên file: UserController.cs
 * Mô tả: Quản lý tài khoản người dùng hệ thống (Admin, Editor...).
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin")] // CHỈ ADMIN MỚI ĐƯỢC QUẢN LÝ NGƯỜI DÙNG
    public class UserController : Controller
    {
        private readonly CMSDbContext _context;

        public UserController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. HIỂN THỊ DANH SÁCH
        public async Task<IActionResult> Index()
        {
            var users = await _context.Users.ToListAsync();
            return View(users);
        }

        // 2. THÊM MỚI (GET)
        [HttpGet]
        public IActionResult Create() => View();

        // 3. THÊM MỚI (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(User user)
        {
            if (ModelState.IsValid)
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                TempData["Success"] = $"Đã thêm tài khoản '{user.Username}' thành công!";
                return RedirectToAction(nameof(Index));
            }
            return View(user);
        }

        // 4. CHỈNH SỬA (GET)
        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return View(user);
        }

        // 5. CHỈNH SỬA (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, User user)
        {
            if (id != user.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(user);
                    await _context.SaveChangesAsync();
                    TempData["Success"] = $"Đã cập nhật tài khoản '{user.Username}' thành công!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.Users.Any(e => e.Id == user.Id)) return NotFound();
                    else throw;
                }
            }
            return View(user);
        }

        // 6. XÓA NGƯỜI DÙNG
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                string username = user.Username;
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                TempData["Success"] = $"Đã xóa tài khoản '{username}' thành công!";
            }
            else
            {
                TempData["Error"] = "Không tìm thấy người dùng cần xóa.";
            }
            return RedirectToAction(nameof(Index));
        }
    }
}