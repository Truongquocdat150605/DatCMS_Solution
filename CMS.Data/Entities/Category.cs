




/* * Tên file: Category.cs
 * Trương Quốc Dat
 * MSSV:2123110209
 * Mô tả: Thực thể lưu trữ thông tin các danh mục bài viết .
 * Chức năng: Phân loại các bài viết trong hệ thống CMS.
 */
using System.Collections.Generic;

namespace CMS.Data.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        // Quan hệ: Một danh mục có nhiều bài viết
        public virtual ICollection<Post> Posts { get; set; }
    }
}