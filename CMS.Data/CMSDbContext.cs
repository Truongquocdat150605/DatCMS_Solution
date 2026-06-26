/* * Tên file: CMSDbContext.cs
 * Trương Quốc Dat
 * MSSV: 2123110209
 * Ngày tạo: 15/05/2026  
 * Mô tả: Lớp trung gian kết nối mã nguồn C# với SQL Server (Entity Framework Core).
 * Chức năng: Quản lý việc truy vấn, cập nhật dữ liệu và ánh xạ các Entities thành bảng trong Database.
 */

using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace CMS.Data
{
    public class CMSDbContext : DbContext
    {
        public CMSDbContext(DbContextOptions<CMSDbContext> options) : base(options)
        {
        }

        // Khai báo các bảng dữ liệu trong hệ thống CMS
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<CategoryProduct> CategoryProducts { get; set; }
        public DbSet<Advertisement> Advertisements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
