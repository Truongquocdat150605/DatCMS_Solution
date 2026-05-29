/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 22/05/2026
 * Tên file: CategoryProductController.cs
 * Mô tả: Quản lý danh mục loại sản phẩm - Đã fix chống trùng tên và kiểm tra ràng buộc khi xóa.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; // ✅ THÊM DÒNG NÀY
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")] // ✅ THÊM DÒNG NÀY
    public class CategoryProductController : Controller
    {
        private readonly CMSDbContext _context;

        public CategoryProductController(CMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var data = await _context.CategoryProducts.ToListAsync();
            return View(data);
        }

        [HttpGet]
        public IActionResult Create() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CategoryProduct categoryProduct)
        {
            var isExist = await _context.CategoryProducts.AnyAsync(c => c.Name == categoryProduct.Name);
            if (isExist)
            {
                ModelState.AddModelError("Name", "Tên danh mục này đã tồn tại rồi Đạt ơi!");
            }

            ModelState.Remove("Products");
            if (ModelState.IsValid)
            {
                _context.CategoryProducts.Add(categoryProduct);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(categoryProduct);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var data = await _context.CategoryProducts.FindAsync(id);
            if (data == null) return NotFound();
            return View(data);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, CategoryProduct categoryProduct)
        {
            if (id != categoryProduct.Id) return NotFound();

            var isExist = await _context.CategoryProducts
                .AnyAsync(c => c.Name == categoryProduct.Name && c.Id != id);
            if (isExist)
            {
                ModelState.AddModelError("Name", "Tên danh mục này đã bị trùng với cái khác!");
            }

            ModelState.Remove("Products");
            if (ModelState.IsValid)
            {
                _context.Update(categoryProduct);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(categoryProduct);
        }

        // ✅ CHỈ ADMIN MỚI ĐƯỢC XÓA
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryProductId == id);

            if (hasProducts)
            {
                TempData["Error"] = "Không thể xóa! Danh mục này đang có sản phẩm. M phải xóa hết sản phẩm thuộc danh mục này trước.";
                return RedirectToAction(nameof(Index));
            }

            var data = await _context.CategoryProducts.FindAsync(id);
            if (data != null)
            {
                _context.CategoryProducts.Remove(data);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}