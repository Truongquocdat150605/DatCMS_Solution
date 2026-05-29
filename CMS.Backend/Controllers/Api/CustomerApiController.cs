using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerApiController : ControllerBase
    {
        private readonly CMSDbContext _context;

        public CustomerApiController(CMSDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            var customers = await _context.Customers.Include(c => c.Orders).ToListAsync();
            if (customers == null || !customers.Any()) return NotFound(new { message = "Không tìm thấy khách hàng nào." });
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers.Include(c => c.Orders).FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null) return NotFound(new { message = $"Không tìm thấy khách hàng ID = {id}." });
            return Ok(customer);
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer([FromBody] Customer customer)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCustomer(int id, [FromBody] Customer customer)
        {
            if (id != customer.Id) return BadRequest(new { message = "ID không khớp." });
            _context.Entry(customer).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) {
                if (!_context.Customers.Any(e => e.Id == id)) return NotFound(new { message = "Khách hàng không tồn tại." });
                else throw;
            }
            return Ok(new { message = "Cập nhật thành công!", data = customer });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(new { message = "Khách hàng không tồn tại." });
            var hasOrders = await _context.Orders.AnyAsync(o => o.CustomerId == id);
            if (hasOrders) return BadRequest(new { message = "Không thể xóa khách hàng đã có đơn hàng." });
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa khách hàng thành công." });
        }
    }
}
