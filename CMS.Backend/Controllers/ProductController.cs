/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 22/05/2026
 * Tên file: ProductController.cs
 * Mô tả: Đã sửa lỗi khớp tên CategoryProductId với Entity.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")] // Backend chỉ dành cho Admin và Editor
    public class ProductController : Controller
    {
        private readonly CMSDbContext _context;

        public ProductController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. DANH SÁCH SẢN PHẨM
        public async Task<IActionResult> Index()
        {
            var products = await _context.Products.Include(p => p.CategoryProduct).ToListAsync();
            return View(products);
        }

        // 2. THÊM MỚI (GET)
        [HttpGet]
        [Authorize(Roles = "Admin, Editor")] // Chỉ Admin và Editor được thêm mới
        public async Task<IActionResult> Create()
        {
            ViewBag.CategoryProductId = new SelectList(await _context.CategoryProducts.ToListAsync(), "Id", "Name");
            return View();
        }

        // 3. THÊM MỚI (POST) - CÓ UPLOAD ẢNH SẢN PHẨM
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin, Editor")]
        public async Task<IActionResult> Create(Product product, IFormFile uploadImage)
        {
            ModelState.Remove("CategoryProduct");
            ModelState.Remove("ImageUrl");

            // ✅ Validate FK trước khi Update để tránh lỗi FK constraint
            bool categoryExists = await _context.CategoryProducts.AnyAsync(c => c.Id == product.CategoryProductId);
            if (!categoryExists)
            {
                ModelState.AddModelError("CategoryProductId", "Danh mục loại sản phẩm không tồn tại. Vui lòng chọn lại.");
            }

            if (ModelState.IsValid)
            {
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = @"D:\CMS_Project\CMS.Backend\wwwroot\uploads\";
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await uploadImage.CopyToAsync(stream);
                    }
                    product.ImageUrl = "/uploads/" + fileName;
                }

                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CategoryProductId = new SelectList(await _context.CategoryProducts.ToListAsync(), "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        // 4. CHỈNH SỬA (GET)
        [HttpGet]
        [Authorize(Roles = "Admin, Editor")] // Chỉ Admin và Editor được sửa
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            ViewBag.CategoryProductId = new SelectList(await _context.CategoryProducts.ToListAsync(), "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        // 5. CHỈNH SỬA (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin, Editor")]
        public async Task<IActionResult> Edit(int id, Product product, IFormFile? uploadImage)
        {
            if (id != product.Id) return NotFound();

            ModelState.Remove("CategoryProduct");
            ModelState.Remove("ImageUrl");

            // ✅ Validate FK trước khi Update để tránh lỗi FK constraint
            bool categoryExists = await _context.CategoryProducts.AnyAsync(c => c.Id == product.CategoryProductId);
            if (!categoryExists)
            {
                ModelState.AddModelError("CategoryProductId", "Danh mục loại sản phẩm không tồn tại. Vui lòng chọn lại.");
            }

            if (ModelState.IsValid)
            {
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = @"D:\CMS_Project\CMS.Backend\wwwroot\uploads\";
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await uploadImage.CopyToAsync(stream);
                    }
                    product.ImageUrl = "/uploads/" + fileName;
                }

                _context.Update(product);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CategoryProductId = new SelectList(await _context.CategoryProducts.ToListAsync(), "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        // 6. XÓA SẢN PHẨM (KIỂM TRA RÀNG BUỘC ĐƠN HÀNG)
        [Authorize(Roles = "Admin")] // Chỉ Admin được xóa
        public async Task<IActionResult> Delete(int id)
        {
            var hasOrderDetails = await _context.OrderDetails.AnyAsync(od => od.ProductId == id);
            if (hasOrderDetails)
            {
                TempData["Error"] = "Không thể xóa! Sản phẩm này đã nằm trong đơn hàng.";
                return RedirectToAction(nameof(Index));
            }

            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}