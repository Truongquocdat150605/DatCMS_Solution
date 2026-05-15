
/* * Tên file: CategoryProduct.cs
 * Mô tả: Thực thể lưu trữ danh mục loại sản phẩm .
 * Chức năng: Phân loại các sản phẩm trong cửa hàng.
 */

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class CategoryProduct
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public virtual ICollection<Product>? Products { get; set; }
    }
}