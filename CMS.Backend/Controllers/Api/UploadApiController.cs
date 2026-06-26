using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadApiController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        // Bơm IWebHostEnvironment để lấy đường dẫn thư mục wwwroot
        public UploadApiController(IWebHostEnvironment env)
        {
            _env = env;
        }

        /// <summary>
        /// API nhận file ảnh từ CKEditor và lưu vào thư mục wwwroot/uploads/ckeditor
        /// </summary>
        [AllowAnonymous]
        [HttpPost("ckeditor")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<IActionResult> UploadImageForCKEditor([FromForm] IFormFile upload)
        {
            // CKEditor SimpleUploadAdapter luôn gửi file với tên biến là "upload"
            if (upload == null || upload.Length == 0)
            {
                // Trả về định dạng lỗi theo chuẩn của CKEditor
                return BadRequest(new { error = new { message = "Không tìm thấy file tải lên." } });
            }

            try
            {
                // Khởi tạo thư mục nếu chưa tồn tại
                string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "ckeditor");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Đổi tên file để tránh trùng lặp (Gắn UUID vào tên file gốc)
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + upload.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Lưu file vật lý xuống đĩa
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await upload.CopyToAsync(fileStream);
                }

                // Xây dựng Absolute URL để trả về cho Frontend hiển thị ảnh
                var request = HttpContext.Request;
                string baseUrl = $"{request.Scheme}://{request.Host}{request.PathBase}";
                string imageUrl = $"{baseUrl}/uploads/ckeditor/{uniqueFileName}";

                // BẮT BUỘC TRẢ VỀ JSON CHUẨN CỦA CKEDITOR
                // Docs: https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/simple-upload-adapter.html#successful-upload
                return Ok(new
                {
                    url = imageUrl
                });
            }
            catch (Exception ex)
            {
                // Báo lỗi theo cấu trúc CKEditor mong đợi
                return StatusCode(500, new { error = new { message = "Lỗi hệ thống: " + ex.Message } });
            }
        }
    }
}
