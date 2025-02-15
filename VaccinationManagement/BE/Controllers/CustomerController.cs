using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.AuthFeature.Commands;
using VaccinationManagement.Features.CustomerFeature.Commands;
using VaccinationManagement.Features.CustomerFeature.Queries;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : Controller
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _context;

        public CustomerController(IMediator mediator, ApplicationDbContext context)
        {
            _mediator = mediator;
            _context = context;
        }

        // GET: api/Customer
        /// API Get list Customer
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return Ok(await _mediator.Send(new GetCustomers()));
        }

        [HttpGet("get-by-email")]
        public async Task<ActionResult<Customer>> GetCustomerByEmail([FromQuery] string email)
        {
            return Ok(await _mediator.Send(new GetCustomerByEmail { Email = email }));
        }

        // GET: api/Customer/query
        /// API Get list Customer with pagination and search
        [HttpGet("query")]
        public async Task<IActionResult> GetListCustomer([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null, [FromQuery] bool isActive = true)
        {
            try
            {
                var query = new GetCustomersQuery
                {
                    Page = page,
                    PageSize = pageSize,
                    SearchTerm = searchTerm,
                    IsActive = isActive
                };

                var result = await _mediator.Send(query);

                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET: api/Customer/get-last-customer
        /// API Get last Customer
        [HttpGet("get-last-customer")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetLastCustomer()
        {
            return Ok(await _mediator.Send(new GetLastCustomer()));
        }

        // GET: api/Customer/check-existence
        /// API check username, password and phone
        [HttpGet("check-existence")]
        public async Task<IActionResult> CheckExistence([FromQuery] string? username, [FromQuery] string? email, [FromQuery] string? phone)
        {
            var query = new CheckUserExistence(username, email, phone);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        // POST: api/Customer
        /// API Create Customer
        [HttpPost]
        public async Task<IActionResult> AddCustomer([FromBody] CreateCustomer command)
        {
            try
            {
                var message = await _mediator.Send(command);
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/Customer
        /// API Update Customer
        [HttpPut]
        public async Task<IActionResult> UpdateCustomer(UpdateCustomer command)
        {
            try
            {
                var updateId = await _mediator.Send(command);
                return Ok(new { CustomerId = updateId });
            }
            catch (Exception ex)
            {
                // Log the exception or return a more specific error response
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/Customer/inactive
        // Make Customers Inactive
        [HttpPut("inactive")]
        public async Task<IActionResult> MakeCustomersInactive([FromBody] UpdateCustomerStatus command)
        {
            try
            {
                var result = await _mediator.Send(command);

                if (result)
                    return Ok(new { message = "Customers changed status successfully." });
                else
                    return NotFound(new { message = "No customers found to update." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCustomer command)
        {
            try
            {
                var customer = await _mediator.Send(command);

                if (customer == null)
                {
                    return NotFound($"Customer with ID {command.Id} not found");
                }

                return Ok("Password changed successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while changing the password" });
            }
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomerReportFilter([FromQuery] QueryCustomerDTO query)
        {
            return Ok(await _mediator.Send(new GetCustomerFilterQuery { query = query }));
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadDir = Path.Combine("wwwroot", "Uploads/Customer");

            // Ensure the directory exists
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadDir, fileName);

            // Save the file to the directory
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/Uploads/Customer/{fileName}";

            return Ok(new { url = imageUrl });
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token,
            [FromQuery] string newEmail)
        {
            try
            {
                await _mediator.Send(new ConfirmEmailChange
                {
                    Token = token,
                    NewEmail = newEmail
                });

                return Redirect
                    ($"http://localhost:3000/change-email-success?token={token}&newEmail={newEmail}");
            }

            catch (ArgumentException)
            {
                return Redirect
                    ($"http://localhost:3000/change-email-fail");
            }
        }

        [HttpPut("change-email")]
        public async Task<IActionResult> ChangeEmail(ChangeEmail command)
        {
            try
            {
                var request = await _mediator.Send(command);
                return Ok(new
                {
                    message = $"To confirm your email address," +
                    $" please click on the link sent to <strong>{request}</strong> to continue."
                });
            }

            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }

        [HttpPost("check-phone-email")]
        public async Task<IActionResult> CheckExistence([FromBody] CheckPhoneOrEmailExist request)
        {
            try
            {
                var result = await _mediator.Send(new CheckPhoneOrEmailExist(request?.Email, request?.Phone, request.Id));
                return Ok(new Response
                {
                    Message = "Ok",
                    Data = result
                });
            }
            catch (ArgumentException ex)
            {
                return Ok(new Response
                {
                    Message = ex.Message,
                    Data = true,
                });
            }
        }

        [HttpPost("check-username")]
        public async Task<IActionResult> CheckUsername([FromBody] CheckUsernameQuery request)
        {
            try
            {
                var result = await _mediator.Send(new CheckUsernameQuery(request?.Username, request!.Id));
                return Ok(new Response
                {
                    Message = "OK",
                    Data = result
                });
            }
            catch (ArgumentException ex)
            {
                return Ok(new Response
                {
                    Message = ex.Message,
                    Data = true,
                });
            }
        }
    }
}
