

/* * Tên file: Product.cs
 * Mô tả: Thực thể lưu trữ thông tin chi tiết về sản phẩm.
 * Chức năng: Quản lý tên, giá, số lượng tồn kho và hình ảnh sản phẩm.
 */
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public string? ImageUrl { get; set; }

        public int CategoryProductId { get; set; }

        [ForeignKey("CategoryProductId")]
        public virtual CategoryProduct? CategoryProduct { get; set; }
    }
}