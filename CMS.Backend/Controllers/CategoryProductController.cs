/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 22/05/2026
 * Tên file: CategoryProductController.cs
 * Mô tả: Quản lý danh mục loại sản phẩm - Đã fix chống trùng tên và kiểm tra ràng buộc khi xóa.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")]
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
        public async Task<IActionResult> Create(CategoryProduct categoryProduct, IFormFile uploadImage)
        {
            var isExist = await _context.CategoryProducts.AnyAsync(c => c.Name == categoryProduct.Name);
            if (isExist)
            {
                ModelState.AddModelError("Name", "Tên danh mục này đã tồn tại rồi Đạt ơi!");
            }

            ModelState.Remove("Products");
            if (ModelState.IsValid)
            {
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = @"D:\CMS_Project\CMS.Backend\wwwroot\uploads\categories";
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await uploadImage.CopyToAsync(stream);
                    }

                    categoryProduct.ImageUrl = "/uploads/categories/" + fileName;
                }

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
        public async Task<IActionResult> Edit(int id, CategoryProduct categoryProduct, IFormFile? uploadImage)
        {
            if (id != categoryProduct.Id) return NotFound();

            var oldData = await _context.CategoryProducts.FindAsync(id);
            if (oldData == null) return NotFound();

            var isExist = await _context.CategoryProducts
                .AnyAsync(c => c.Name == categoryProduct.Name && c.Id != id);
            if (isExist)
            {
                ModelState.AddModelError("Name", "Tên danh mục này đã bị trùng với cái khác!");
            }

            ModelState.Remove("Products");
            if (ModelState.IsValid)
            {
                // Tránh track 2 instance cùng Id: cập nhật trực tiếp trên oldData đang được EF theo dõi
                oldData.Name = categoryProduct.Name;
                oldData.Description = categoryProduct.Description;

                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = @"D:\CMS_Project\CMS.Backend\wwwroot\uploads\categories";
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await uploadImage.CopyToAsync(stream);
                    }

                    oldData.ImageUrl = "/uploads/categories/" + fileName;
                }
                // else: không upload => giữ oldData.ImageUrl cũ

                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            // Nếu invalid thì render lại form (categoryProduct là model binder tạo ra)
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