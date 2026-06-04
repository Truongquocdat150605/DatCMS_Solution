/* * Người thực hiện: Trương Quốc Đạt - 2123110209
 * Tên file: CategoryController.cs
 * Mô tả: Đã bổ sung chống trùng tên và kiểm tra ràng buộc với bảng Post.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")]
    public class CategoryController : Controller
    {
        private readonly CMSDbContext _db;

        public CategoryController(CMSDbContext db)
        {
            _db = db;
        }

        public async Task<IActionResult> Index()
        {
            var data = await _db.Categories.ToListAsync();
            return View(data);
        }

        [HttpGet]
        public IActionResult Create() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Category category)
        {
            var isExist = await _db.Categories.AnyAsync(c => c.Name == category.Name);
            if (isExist)
            {
                ModelState.AddModelError("Name", "Tên danh mục bài viết này đã có rồi Đạt ơi!");
            }

            ModelState.Remove("Posts");
            if (ModelState.IsValid)
            {
                _db.Categories.Add(category);
                await _db.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(category);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return NotFound();
            return View(category);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Category category)
        {
            if (id != category.Id) return NotFound();

            var isExist = await _db.Categories.AnyAsync(c => c.Name == category.Name && c.Id != id);
            if (isExist)
            {
                ModelState.AddModelError("Name", "Tên này bị trùng với danh mục bài viết khác rồi!");
            }

            ModelState.Remove("Posts");
            if (ModelState.IsValid)
            {
                _db.Update(category);
                await _db.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(category);
        }

        // ✅ CHỈ ADMIN MỚI ĐƯỢC XÓA
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var hasPosts = await _db.Posts.AnyAsync(p => p.CategoryId == id);

            if (hasPosts)
            {
                TempData["Error"] = "Không thể xóa! Danh mục này đang có bài viết. M phải xóa các bài viết liên quan trước.";
                return RedirectToAction(nameof(Index));
            }

            var category = await _db.Categories.FindAsync(id);
            if (category != null)
            {
                _db.Categories.Remove(category);
                await _db.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}