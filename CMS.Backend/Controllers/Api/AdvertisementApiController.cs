using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdvertisementApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public AdvertisementApiController(CMSDbContext context)
        {
            _context = context;
        }

        // GET: api/AdvertisementApi/banners
        // Trả về danh sách các banner đang active, sắp xếp theo thứ tự hiển thị (DisplayOrder)
        [AllowAnonymous]
        [HttpGet("banners")]
        public async Task<IActionResult> GetBanners()
        {
            try
            {
                var banners = await _context.Advertisements
                    .Where(a => a.IsActive)
                    .OrderBy(a => a.DisplayOrder)
                    .ThenByDescending(a => a.CreatedAt)
                    .Select(a => new
                    {
                        a.Id,
                        a.Title,
                        a.ImageUrl,
                        a.LinkUrl
                    })
                    .ToListAsync();

                return Ok(banners);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu banner: " + ex.Message });
            }
        }
        
        // Đoạn code dưới đây để dùng tạm cho việc seed dữ liệu (có thể xóa sau khi có UI Admin)
        [AllowAnonymous]
        [HttpPost("seed")]
        public async Task<IActionResult> SeedBanners()
        {
            if (await _context.Advertisements.AnyAsync())
            {
                return BadRequest(new { message = "Dữ liệu banner đã tồn tại." });
            }

            var banners = new List<Advertisement>
            {
                new Advertisement
                {
                    Title = "Khuyến mãi Mùa Hè 50%",
                    ImageUrl = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
                    LinkUrl = "/category/khuyen-mai",
                    DisplayOrder = 1,
                    IsActive = true
                },
                new Advertisement
                {
                    Title = "Bộ sưu tập Mới 2026",
                    ImageUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
                    LinkUrl = "/category/hang-moi-ve",
                    DisplayOrder = 2,
                    IsActive = true
                },
                new Advertisement
                {
                    Title = "Giao hàng Miễn phí toàn quốc",
                    ImageUrl = "https://images.unsplash.com/photo-1580828369019-2238f6982cb1?q=80&w=2072&auto=format&fit=crop",
                    LinkUrl = null,
                    DisplayOrder = 3,
                    IsActive = true
                }
            };

            _context.Advertisements.AddRange(banners);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo dữ liệu mẫu thành công!", data = banners });
        }
    }
}
