using Microsoft.AspNetCore.Mvc;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")] // Backend chỉ dành cho Admin và Editor
    public class PostController : Controller
    {
        private readonly CMSDbContext _context;

        public PostController(CMSDbContext context)
        {
            _context = context;
        }

        // 1. DANH SÁCH BÀI VIẾT
        public async Task<IActionResult> Index(string searchTerm, int? categoryId)
        {
            var query = _context.Posts.Include(p => p.Category).AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(p => p.Title.Contains(searchTerm) || p.Content.Contains(searchTerm));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            var results = await query.OrderByDescending(p => p.Id).ToListAsync();
            ViewBag.Categories = await _context.Categories.ToListAsync();
            return View(results);
        }

        // 2. THÊM MỚI (GET)
        [HttpGet]
        [Authorize(Roles = "Admin, Editor")] // Chỉ Admin và Editor được thêm bài
        public async Task<IActionResult> Create()
        {
            ViewBag.CategoryId = await _context.Categories.ToListAsync();
            return View();
        }

        // 3. THÊM MỚI (POST) - CÓ XỬ LÝ UPLOAD ẢNH
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin, Editor")]
        public async Task<IActionResult> Create(Post post, IFormFile uploadImage)
        {
            ModelState.Remove("Category");
            ModelState.Remove("ImageUrl");

            if (ModelState.IsValid)
            {
                // Xử lý Upload Ảnh
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
                    post.ImageUrl = "/uploads/" + fileName;
                }

                _context.Posts.Add(post);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CategoryId = await _context.Categories.ToListAsync();
            return View(post);
        }

        // 4. CHỈNH SỬA (GET)
        [Authorize(Roles = "Admin, Editor")] // Chỉ Admin và Editor được sửa
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();
            ViewBag.CategoryId = await _context.Categories.ToListAsync();
            return View(post);
        }

        // 5. CHỈNH SỬA (POST)
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin, Editor")]
        public async Task<IActionResult> Edit(int id, Post post, IFormFile? uploadImage)
        {
            if (id != post.Id) return NotFound();

            ModelState.Remove("Category");
            ModelState.Remove("ImageUrl");

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
                    post.ImageUrl = "/uploads/" + fileName;
                }

                _context.Update(post);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewBag.CategoryId = await _context.Categories.ToListAsync();
            return View(post);
        }

        // 6. XÓA BÀI VIẾT
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được xóa bài
        public async Task<IActionResult> Delete(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post != null)
            {
                _context.Posts.Remove(post);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
}