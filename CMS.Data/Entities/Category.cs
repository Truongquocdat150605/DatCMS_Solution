/* * Tên file: Category.cs
 * Người thực hiện: Trương Quốc Đạt
 * MSSV: 2123110209
 * Mô tả: Thực thể lưu trữ thông tin các danh mục bài viết.
 * Chức năng: Phân loại các bài viết trong hệ thống CMS (Đã fix lỗi Nullable).
 */
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace CMS.Data.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string? Name { get; set; } // Thêm dấu ?
        public string? Description { get; set; } // Thêm dấu ?

        // Quan hệ: Một danh mục có nhiều bài viết
        [JsonIgnore]
        public virtual ICollection<Post>? Posts { get; set; } // Thêm dấu ?
    }
}