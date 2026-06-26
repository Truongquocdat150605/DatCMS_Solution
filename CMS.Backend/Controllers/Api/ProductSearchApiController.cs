using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/Products")]
    [ApiController]
    public class ProductSearchApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public ProductSearchApiController(CMSDbContext context)
        {
            _context = context;
        }

        // GET: /api/Products/search?keyword=...&page=1&pageSize=20
        // Trả về: totalCount + products (phân trang)
        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts(
            string keyword,
            int page = 1,
            int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                // NOTE: Contains trên SQL Server sẽ được dịch thành LIKE '%...%'
                // Hãy dùng index Full-text nếu cần tối ưu sâu hơn.
                query = query.Where(p => p.Name != null && p.Name.Contains(keyword));
            }

            var totalCount = await query.CountAsync();

            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalCount,
                products,
                page,
                pageSize
            });
        }
    }
}

