/* * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Ngày thực hiện: 17/05/2026
 * Mô tả: Controller quản lý bài viết (Post) - Bài tập rèn luyện Buổi 02.
 * Chức năng: Thực hiện Dependency Injection và lấy danh sách bài viết từ SQL.
 */

using Microsoft.AspNetCore.Mvc;
using CMS.Data; // Để hiểu CMSDbContext
using CMS.Data.Entities; // Để hiểu thực thể Post
using Microsoft.EntityFrameworkCore; // Để dùng lệnh Include và ToListAsync
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CMS.Data;           // Để hiểu CMSDbContext
using CMS.Data.Entities;  // QUAN TRỌNG: Để hiểu 'Post' và 'Category'
using Microsoft.EntityFrameworkCore; // Để hiểu 'Include' và 'ToListAsync'
namespace CMS.Backend.Controllers
{
    public class PostController : Controller
    {
        private readonly CMSDbContext _context;

        // Tiêm DbContext vào thông qua Constructor
        public PostController(CMSDbContext context)
        {
            _context = context;
        }

        // Action Index: Trả về danh sách bài viết ra giao diện
        public async Task<IActionResult> Index()
        {
            // Lấy danh sách bài viết, kèm theo thông tin Category để biết bài đó thuộc mục nào
            var posts = await _context.Posts.Include(p => p.Category).ToListAsync();
            return View(posts);
        }
    }
}