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
using System.Threading.Tasks;

namespace CMS.Backend.Controllers
{
    public class ProductController : Controller
    {
        private readonly CMSDbContext _context;

        public ProductController(CMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var products = await _context.Products
                .Include(p => p.CategoryProduct)
                .ToListAsync();
            return View(products);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            // Sửa tên field thành CategoryProductId
            ViewBag.CategoryProductId = new SelectList(await _context.Categories.ToListAsync(), "Id", "Name");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Product product)
        {
            ModelState.Remove("CategoryProduct");

            // 1. KIỂM TRA TRÙNG TÊN:
            var isExist = await _context.Products.AnyAsync(p => p.Name == product.Name);
            if (isExist)
            {
                ModelState.AddModelError("Name", "Tên sản phẩm này đã tồn tại trong hệ thống rồi Đạt ơi!");
            }

            if (ModelState.IsValid)
            {
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.CategoryProductId = new SelectList(await _context.Categories.ToListAsync(), "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            // Sửa tên field thành CategoryProductId
            ViewBag.CategoryProductId = new SelectList(await _context.Categories.ToListAsync(), "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Product product)
        {
            if (id != product.Id) return NotFound();
            ModelState.Remove("CategoryProduct");
            if (ModelState.IsValid)
            {
                _context.Update(product);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CategoryProductId = new SelectList(await _context.Categories.ToListAsync(), "Id", "Name", product.CategoryProductId);
            return View(product);
        }

        // XÓA SẢN PHẨM
        public async Task<IActionResult> Delete(int id)
        {
            var hasOrderDetails = await _context.OrderDetails.AnyAsync(od => od.ProductId == id);
            if (hasOrderDetails)
            {
                TempData["Error"] = "Không thể xóa! Sản phẩm này đã từng được mua (nằm trong đơn hàng). Phải xóa đơn hàng chứa sản phẩm này trước.";
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