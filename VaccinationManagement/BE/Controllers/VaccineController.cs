using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.MenuFeature.Queries;
using VaccinationManagement.Features.VaccinationResultFeature.Queries;
using VaccinationManagement.Features.VaccineFeature.Commands;
using VaccinationManagement.Features.VaccineFeature.Queries;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VaccineController : Controller
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _context;

        public VaccineController(IMediator mediator, ApplicationDbContext context)
        {
            _mediator = mediator;
            _context = context;
        }
        
        // GET: api/Vaccine
        /// API Get all Vaccine
        [HttpGet("get-all")]
        public async Task<ActionResult<IEnumerable<Vaccine>>> GetVaccines()
        {
            return Ok(await _mediator.Send(new GetAllVaccines()));
        }
        
        // GET: api/vaccines?page=1&pageSize=10&searchTerm=test
        /// <summary>
        /// Get Vaccine with Pagination and Search
        /// </summary>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="searchTerm"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetVaccines([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null, [FromQuery] bool isActive = true)
        {
            try
            {
                var query = new GetVaccinesQuery
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

        [HttpGet("get-by-typeId")]
        public async Task<IActionResult> GetVaccineByVaccineTupeId([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null, [FromQuery] string? vaccineTypeId = "")
        {
            try
            {
                var query = new GetVaccineByVaccineTypeId
                {
                    Page = page,
                    PageSize = pageSize,
                    SearchTerm = searchTerm,
                    VaccineTypeId = vaccineTypeId
                };

                var result = await _mediator.Send(query);

                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET: api/Vaccine?id
        /// API Get Vaccine by id
        [HttpGet("{id}")]
        public async Task<ActionResult<Vaccine>> GetVaccineById(string id)
        {
            var query = new GetVaccineById { Id = id };
            var vaccine = await _mediator.Send(query);

            if (vaccine == null)
            {
                return NotFound();
            }
            
            return Ok(vaccine);
        }

        [HttpGet("generate-id")]
        public async Task<IActionResult> GenerateVaccineId()
        {
            var newId = await _mediator.Send(new GenerateVaccineId());
            return Ok(newId);
        }

        [HttpPost]
        public async Task<IActionResult> AddVaccine([FromBody] CreateVaccine command)
        {
            try
            {
                var mess = await _mediator.Send(command);
                return Ok(new { Message = mess });
            }
            catch (Exception ex)
            {
                // Log the exception or return a more specific error response
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpGet("distribution")]
        public async Task<ActionResult<IEnumerable<Distribution>>> GetVaccineDistributions()
        {
            return Ok(await _mediator.Send(new GetVaccineDistributions()));
        }

        [HttpGet("distribution/paged")]
        public async Task<ActionResult<PaginatedList<Distribution>>> GetVaccineDistributionsFilter([FromQuery] QueryDistributionDTO query)
        {
            return Ok(await _mediator.Send(new GetVaccineDistributionsQuery{ query = query }));
        }

        [HttpGet("distribution/vaccineandplace/paged")]
        public async Task<ActionResult<PaginatedList<Distribution>>> GetVaccineDistributionsGroupedByVacIdAndPlaceIdFilter([FromQuery] QueryDistributionDTO query)
        {
            return Ok(await _mediator.Send(new GetVaccineDistributionsGroupedQuery{ query = query }));
        }

        [HttpPost("distribute")]
        public async Task<IActionResult> AddVaccine([FromBody] DistributeVaccine command)
        {
            try
            {
                var newDistributionId = await _mediator.Send(command);
                return Ok(new { DistributionId = newDistributionId });
            }
            catch (Exception ex)
            {
                // Log the exception or return a more specific error response
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/Vaccine
        [HttpPut]
        public async Task<IActionResult> UpdateVaccine(UpdateVaccine command)
        {
            try
            {
                var mess = await _mediator.Send(command);
                return Ok(new { Message = mess });
            }
            catch (Exception ex)
            {
                // Log the exception or return a more specific error response
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/Vaccine/inactive
        // Make Vaccines Inactive
        [HttpPut("inactive")]
        public async Task<IActionResult> MakeVaccinesInactive([FromBody] UpdateVaccinesStatus command)
        {
            try
            {
                var result = await _mediator.Send(command);

                if (result)
                    return Ok(new { message = "Vaccines marked as inactive successfully." });
                else
                    return NotFound(new { message = "No vaccines found to update." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/Vaccine/distribute-update
        // Update Distribution Vaccine Quantity_Injected
        [HttpPut("distribute-update")]
        public async Task<IActionResult> UpdateDistributionVaccineQuantity([FromBody] UpdateDistributionVaccineQuantity command)
        {
            try
            {
                var updatedDistributionId = await _mediator.Send(command);
                return Ok(new { DistributionId = updatedDistributionId });
            }
            catch (Exception ex)
            {
                // Log the exception or return a more specific error response
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportVaccines([FromForm] ImportVaccines command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

		[HttpGet("filter")]
		public async Task<ActionResult<IEnumerable<Injection_Result>>> GetVaccinationsFilter([FromQuery] QueryVaccineDTO query)
		{
			return Ok(await _mediator.Send(new GetVaccinationFilterQuery { query = query }));
		}

		[HttpGet("date-range")]
		public async Task<IActionResult> GetDateRange()
		{
			var result = await _mediator.Send(new GetRangeYearVaccineQuery());
			return Ok(result);
		}

		[HttpGet("monthly-summary")]
		public async Task<IActionResult> GetMonthlyInjectionSummary(int year)
		{
			var result = await _mediator.Send(new GetMonthlyVaccineSummaryQuery(year));
			return Ok(result);
		}

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadDir = Path.Combine("wwwroot", "Uploads/Vaccine");

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

            var imageUrl = $"/Uploads/Vaccine/{fileName}";

            return Ok(new { url = imageUrl });
        }

        [HttpGet("all-vaccines")]
        public async Task<IActionResult> GetAllVaccines([FromQuery] GetAllVaccineList request)
        {
            return Ok(await _mediator.Send(request));
        }
    }
}
