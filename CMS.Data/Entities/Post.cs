

/* * Tên file: Post.cs
 * Mô tả: Thực thể lưu trữ nội dung chi tiết của một bài viết.
 * Chức năng: Chứa tiêu đề, nội dung, hình ảnh và liên kết với danh mục bài viết.
 */
using System;

namespace CMS.Data.Entities
{
    public class Post
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Khóa ngoại liên kết tới Category
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; }
    }
}