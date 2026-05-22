/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 22/05/2026
 * Tên file: CategoryProductController.cs
 * Mô tả: Quản lý danh mục loại sản phẩm - Đã fix chống trùng tên và kiểm tra ràng buộc khi xóa.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    public class CategoryProductController : Controller
    {
        private readonly CMSDbContext _context;

        public CategoryProductController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. DANH SÁCH
        public async Task<IActionResult> Index()
        {
            var data = await _context.CategoryProducts.ToListAsync();
            return View(data);
        }

        // 2. THÊM MỚI (GET)
        [HttpGet]
        public IActionResult Create() => View();

        // 3. THÊM MỚI (POST) - Cập nhật logic chống trùng tên
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CategoryProduct categoryProduct)
        {
            // Kiểm tra trùng tên danh mục
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

        // 4. CHỈNH SỬA (GET)
        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var data = await _context.CategoryProducts.FindAsync(id);
            if (data == null) return NotFound();
            return View(data);
        }

        // 5. CHỈNH SỬA (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, CategoryProduct categoryProduct)
        {
            if (id != categoryProduct.Id) return NotFound();

            // Kiểm tra trùng tên với các danh mục khác (ngoại trừ chính nó)
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

        // 6. XÓA DANH MỤC (Có kiểm tra ràng buộc Cha-Con)
        public async Task<IActionResult> Delete(int id)
        {
            // Kiểm tra xem có sản phẩm nào đang thuộc danh mục này không
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryProductId == id);

            if (hasProducts)
            {
                // Thông báo lỗi ra View nếu còn dữ liệu con
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