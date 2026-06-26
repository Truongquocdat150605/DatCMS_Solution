using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Threading.Tasks;
using System.Linq;

namespace CMS.Backend.Controllers
{
    [Authorize(Roles = "Admin, Editor")]
    public class AdvertisementController : Controller
    {
        private readonly CMSDbContext _context;

        public AdvertisementController(CMSDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            return View(await _context.Advertisements.OrderBy(a => a.DisplayOrder).ThenByDescending(a => a.CreatedAt).ToListAsync());
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new Advertisement { IsActive = true, DisplayOrder = 0 });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Advertisement advertisement)
        {
            if (ModelState.IsValid)
            {
                advertisement.CreatedAt = System.DateTime.UtcNow;
                _context.Advertisements.Add(advertisement);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Thêm banner thành công!";
                return RedirectToAction(nameof(Index));
            }
            return View(advertisement);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var adv = await _context.Advertisements.FindAsync(id);
            if (adv == null) return NotFound();
            return View(adv);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Advertisement advertisement)
        {
            if (id != advertisement.Id) return NotFound();

            if (ModelState.IsValid)
            {
                var existing = await _context.Advertisements.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
                if (existing != null)
                {
                    advertisement.CreatedAt = existing.CreatedAt; // Giữ nguyên ngày tạo
                }

                _context.Update(advertisement);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Cập nhật banner thành công!";
                return RedirectToAction(nameof(Index));
            }
            return View(advertisement);
        }

        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var adv = await _context.Advertisements.FindAsync(id);
            if (adv != null)
            {
                _context.Advertisements.Remove(adv);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Xóa banner thành công!";
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
