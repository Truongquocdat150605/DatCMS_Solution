/* * Tên file: Post.cs
 * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Mô tả: Thực thể bài viết (Đã fix lỗi Nullable).
 */
using System;

namespace CMS.Data.Entities
{
    public class Post
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int CategoryId { get; set; }
        public virtual Category? Category { get; set; } // Thêm dấu ?
    }
}