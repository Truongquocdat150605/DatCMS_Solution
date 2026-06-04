using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/OrderDetails")]
    [ApiController]
    public class OrderDetailApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public OrderDetailApiController(CMSDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails()
        {
            var details = await _context.OrderDetails
                .Include(od => od.Product)
                .Include(od => od.Order)
                .ToListAsync();
            if (details == null || !details.Any()) return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng nào." });
            return Ok(details);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(int id)
        {
            var detail = await _context.OrderDetails
                .Include(od => od.Product)
                .Include(od => od.Order)
                .FirstOrDefaultAsync(od => od.Id == id);
            if (detail == null) return NotFound(new { message = $"Không tìm thấy chi tiết đơn hàng ID = {id}." });
            return Ok(detail);
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<ActionResult<OrderDetail>> PostOrderDetail([FromBody] OrderDetail detail)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.OrderDetails.Add(detail);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrderDetail), new { id = detail.Id }, detail);
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderDetail(int id, [FromBody] OrderDetail detail)
        {
            if (id != detail.Id) return BadRequest(new { message = "ID không khớp." });
            _context.Entry(detail).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) {
                if (!_context.OrderDetails.Any(e => e.Id == id)) return NotFound(new { message = "Chi tiết đơn hàng không tồn tại." });
                else throw;
            }
            return Ok(new { message = "Cập nhật thành công!", data = detail });
        }

        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null) return NotFound(new { message = "Chi tiết đơn hàng không tồn tại." });
            _context.OrderDetails.Remove(detail);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa chi tiết đơn hàng thành công." });
        }
    }
}
