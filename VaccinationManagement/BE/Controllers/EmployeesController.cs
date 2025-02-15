using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.EmployeeFeature.Commands;
using VaccinationManagement.Features.EmployeeFeature.Queries;
using VaccinationManagement.Features.VaccineFeature.Commands;
using VaccinationManagement.Models;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeesController(ApplicationDbContext context, IMediator mediator,
            IWebHostEnvironment env)
        {
            _context = context;
            _mediator = mediator;
            _env = env;
        }

        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;

        // GET: api/Employees
        /// API Get list Employees. Apply search filters and pagination if any
        [HttpGet]
        public async Task<ActionResult<EmployeeListResult>> GetEmployees([FromQuery] GetEmployees query)
        {
            var employeeListResult = await _mediator.Send(query);
            return Ok(employeeListResult);
        }

        // GET: api/Employees/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(string id)
        {
            var employee = await _mediator.Send(new GetEmployeeById { Id = id });

            if (employee == null)
            {
                return BadRequest("Employee not found!");
            }

            return Ok(employee);
        }

        // POST: api/Employees
        // API Add new employee
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Employee>> PostEmployee([FromForm] CreateEmployee employee)
        {
            try
            {
                var newEmp = await _mediator.Send(employee);

                if (newEmp == null)
                {
                    return BadRequest("Error");
                }

                return CreatedAtAction("GetEmployee", new { id = newEmp.Id }, newEmp);
            }
            catch (DuplicateNameException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            catch (Exception ex)    
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Employee>> EditEmployee([FromRoute] string id,
            [FromForm] EditEmployee command)
        {
            try
            {
                command.Id = id;
                var updatedEmployee = await _mediator.Send(command);
                
                return Ok(updatedEmployee);
            }

            catch(DuplicateNameException ex)
            {
                return BadRequest(new {message = ex.Message});
            }

            catch(KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }

        [HttpGet("next-id")]
        public ActionResult<string>? GetNextEmployeeId()
        {
            var latestId = _context.Employees.Max(x => x.Id);

            if(latestId == null)
            {
                return "EM000001";
            }

            IdFormatter idFormatter = new();
            var nextId = idFormatter.NewId(latestId);

            return Ok(nextId);
        }

        [HttpPut("status")]
        public async Task<IActionResult> UpdateEmployeesStatus([FromBody] UpdateEmployeeStatus command)
        {
            try
            {
                var result = await _mediator.Send(command);

                if (result)
                    return Ok(new { message = "Employees marked as inactive successfully." });
                else
                    return NotFound(new { message = "No employee found to update." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePassword command)
        {
            try
            {
                var employee = await _mediator.Send(command);

                if (employee == null)
                {
                    return NotFound($"Employee with ID {command.Id} not found");
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

        [HttpPost("import")]
        public async Task<IActionResult> ImportEmployees([FromForm] ImportEmployee command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(new { message = result });
            }

            catch(ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }

            catch (Exception)
            {
                return BadRequest(new { error = "Failed to import employee. Double check the data and try again." });
            }
        }

        [HttpGet("download-sample")]
        public IActionResult DownloadSampleFile()
        {
            string wwwRootFolder = _env.WebRootPath;

            //Path to the Excel file(/Uploads/employee/sample)
            string filePath = Path.Combine(wwwRootFolder, "Uploads", "employee", "sample", "ImportEmployee.xlsx");

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("File not found.");
            }

            // Read the file as bytes
            var fileBytes = System.IO.File.ReadAllBytes(filePath);

            // Set the MIME type for Excel files
            var mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            // Return the file with the MIME type and filename for download
            return File(fileBytes, mimeType, "ImportEmployee.xlsx");
        }

        [HttpGet("/api/Employees/email/{email}")]
        public async Task<ActionResult<Employee>> GetEmployeeByEmail(string email)
        {

            var employee = await _mediator.Send(new GetEmployeeByEmail { Email = email });

            if (employee == null)
            {
                return NotFound("Employee not found.");
            }

            return Ok(employee);
        }


    }
}
