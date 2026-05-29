/* * Người thực hiện: Trương Quốc Đạt - MSSV: 2123110209
 * Tên file: DbInitializer.cs
 * Mô tả: Khởi tạo dữ liệu mẫu cho hệ thống CMS gồm 8 bảng: 
 * User, Category, Post, Customer, CategoryProduct, Product, Order, OrderDetail.
 */

using CMS.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CMS.Data
{
    public static class DbInitializer
    {
        public static void Initialize(CMSDbContext context)
        {
            context.Database.EnsureCreated();

            // Kiểm tra nếu đã có dữ liệu ở một bảng chính thì dừng lại
            if (context.Users.Any()) return;

            // 1. BẢNG USER (Quản trị viên hệ thống)
            var users = new User[] {
                new User { Username = "admin", PasswordHash = "123456", FullName = "Quản trị viên Đạt", Role = "Admin" },
                new User { Username = "editor", PasswordHash = "123456", FullName = "Nguyễn Văn Biên Tập", Role = "Editor" }
            };
            context.Users.AddRange(users);

            // 2. BẢNG CATEGORY (Danh mục bài viết)
            var categories = new Category[] {
                new Category { Name = "Tin Công Nghệ", Description = "Cập nhật xu hướng phần cứng mới nhất" },
                new Category { Name = "Hướng Dẫn Build PC", Description = "Cách lắp ráp và tối ưu máy tính" }
            };
            context.Categories.AddRange(categories);
            context.SaveChanges();

            // 3. BẢNG POST (Bài viết)
            var posts = new Post[] {
                new Post { Title = "RTX 5090 rò rỉ cấu hình", Content = "Siêu phẩm sắp ra mắt...", CategoryId = categories[0].Id, CreatedDate = DateTime.Now },
                new Post { Title = "Cách lắp tản nhiệt nước", Content = "Các bước chi tiết...", CategoryId = categories[1].Id, CreatedDate = DateTime.Now }
            };
            context.Posts.AddRange(posts);

            // 4. BẢNG CUSTOMER (Khách hàng)
            var customers = new Customer[] {
                new Customer { FullName = "Khách Hàng A", Email = "khach@gmail.com", Phone = "0901234567", Address = "TP.HCM", Password = "123" }
            };
            context.Customers.AddRange(customers);
            context.SaveChanges();

            // 5. BẢNG CATEGORYPRODUCT (Loại sản phẩm)
            var catProducts = new CategoryProduct[] {
                new CategoryProduct { Name = "VGA - Card màn hình", Description = "NVIDIA, AMD" },
                new CategoryProduct { Name = "CPU - Bộ vi xử lý", Description = "Intel, AMD" }
            };
            context.CategoryProducts.AddRange(catProducts);
            context.SaveChanges();

            // 6. BẢNG PRODUCT (Sản phẩm)
            var products = new Product[] {
                new Product { Name = "RTX 4090 ASUS ROG", Price = 55000000, StockQuantity = 5, CategoryProductId = catProducts[0].Id, ImageUrl = "/uploads/vga.jpg" },
                new Product { Name = "Intel Core i9-14900K", Price = 16000000, StockQuantity = 10, CategoryProductId = catProducts[1].Id, ImageUrl = "/uploads/cpu.jpg" }
            };
            context.Products.AddRange(products);
            context.SaveChanges();

            // 7. BẢNG ORDER (Đơn hàng)
            var order = new Order
            {
                CustomerId = customers[0].Id,
                OrderDate = DateTime.Now,
                Status = 0,
                Notes = "Giao giờ hành chính"
            };
            context.Orders.Add(order);
            context.SaveChanges();

            // 8. BẢNG ORDERDETAIL (Chi tiết đơn hàng)
            var orderDetail = new OrderDetail
            {
                OrderId = order.Id,
                ProductId = products[0].Id,
                Quantity = 1,
                UnitPrice = products[0].Price
            };
            context.OrderDetails.Add(orderDetail);

            context.SaveChanges();
        }
    }
}