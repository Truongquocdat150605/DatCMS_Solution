/*
 * PaymentApiController.cs
 * Xử lý: Tạo link thanh toán PayOS, Webhook PayOS, Stripe Session & Webhook
 */
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PayOS;
using PayOS.Models;
using PayOS.Models.Webhooks;
using Stripe;
using Stripe.Checkout;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/Payment")]
    [ApiController]
    public class PaymentApiController : ControllerBase
    {
        private readonly CMSDbContext _context;
        private readonly IConfiguration _configuration;

        public PaymentApiController(CMSDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ─────────────────────────────────────────────
        // PAYOS: Tạo link thanh toán QR chuyển khoản
        // POST: api/Payment/create-payos-link/{orderId}
        // ─────────────────────────────────────────────
        [AllowAnonymous]
        [HttpPost("create-payos-link/{orderId}")]
        public async Task<IActionResult> CreatePayOsLink(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            var payosConfig = _configuration.GetSection("PayOS");
            var client = new PayOSClient(new PayOSOptions
            {
                ClientId = payosConfig["ClientId"]!,
                ApiKey = payosConfig["ApiKey"]!,
                ChecksumKey = payosConfig["ChecksumKey"]!
            });

            // Tạo orderCode duy nhất (dùng timestamp miliseconds lấy 10 số cuối)
            long orderCode = long.Parse(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()[^10..]);

            long totalAmount = (long)order.OrderDetails!.Sum(d => d.UnitPrice * d.Quantity) + 30000;

            var request = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = (int)totalAmount,
                Description = $"Don hang #{orderId}",
                ReturnUrl = $"http://localhost:3000/payment-success?orderId={orderId}&method=PayOS",
                CancelUrl = "http://localhost:3000/cart"
            };

            var paymentLink = await client.PaymentRequests.CreateAsync(request);

            // Lưu orderCode để đối chiếu khi Webhook về
            order.TransactionId = orderCode.ToString();
            order.PaymentStatus = "Pending";
            order.PaymentMethod = "PayOS";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                paymentUrl = paymentLink.CheckoutUrl,
                orderCode = orderCode
            });
        }

        // ─────────────────────────────────────────────
        // PAYOS WEBHOOK
        // POST: api/Payment/payos-webhook
        // ─────────────────────────────────────────────
        [AllowAnonymous]
        [HttpPost("payos-webhook")]
        public async Task<IActionResult> PayOsWebhook([FromBody] Webhook webhookBody)
        {
            try
            {
                var payosConfig = _configuration.GetSection("PayOS");
                var client = new PayOSClient(new PayOSOptions
                {
                    ClientId = payosConfig["ClientId"]!,
                    ApiKey = payosConfig["ApiKey"]!,
                    ChecksumKey = payosConfig["ChecksumKey"]!
                });

                var webhookData = await client.Webhooks.VerifyAsync(webhookBody);

                if (webhookBody.Code == "00" && webhookBody.Success == true)
                {
                    string transactionId = webhookData.OrderCode.ToString();
                    var order = await _context.Orders.FirstOrDefaultAsync(o => o.TransactionId == transactionId);
                    if (order != null)
                    {
                        order.PaymentStatus = "Paid";
                        order.Status = 1; // Đang xử lý
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─────────────────────────────────────────────
        // STRIPE: Tạo Checkout Session
        // POST: api/Payment/create-stripe-session/{orderId}
        // ─────────────────────────────────────────────
        [AllowAnonymous]
        [HttpPost("create-stripe-session/{orderId}")]
        public async Task<IActionResult> CreateStripeSession(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];

            var lineItems = order.OrderDetails!.Select(d => new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "vnd",
                    UnitAmount = (long)d.UnitPrice,
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = d.Product?.Name ?? $"Sản phẩm #{d.ProductId}"
                    }
                },
                Quantity = d.Quantity
            }).ToList();

            // Phí ship
            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "vnd",
                    UnitAmount = 30000,
                    ProductData = new SessionLineItemPriceDataProductDataOptions { Name = "Phí vận chuyển" }
                },
                Quantity = 1
            });

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = lineItems,
                Mode = "payment",
                SuccessUrl = $"http://localhost:3000/payment-success?orderId={orderId}&method=Stripe&session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = "http://localhost:3000/cart",
                Metadata = new Dictionary<string, string> { { "orderId", orderId.ToString() } }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            order.TransactionId = session.Id;
            order.PaymentStatus = "Pending";
            order.PaymentMethod = "Stripe";
            await _context.SaveChangesAsync();

            return Ok(new { success = true, paymentUrl = session.Url });
        }

        // ─────────────────────────────────────────────
        // STRIPE WEBHOOK
        // POST: api/Payment/stripe-webhook
        // ─────────────────────────────────────────────
        [AllowAnonymous]
        [HttpPost("stripe-webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _configuration["Stripe:WebhookSecret"] ?? ""
                );

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session?.Metadata != null && session.Metadata.TryGetValue("orderId", out var orderIdStr))
                    {
                        if (int.TryParse(orderIdStr, out int orderId))
                        {
                            var order = await _context.Orders.FindAsync(orderId);
                            if (order != null)
                            {
                                order.PaymentStatus = "Paid";
                                order.Status = 1;
                                await _context.SaveChangesAsync();
                            }
                        }
                    }
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
