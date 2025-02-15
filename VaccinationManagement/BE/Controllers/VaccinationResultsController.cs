using MediatR;
using Microsoft.AspNetCore.Mvc;
using VaccinationManagement.Features.VaccinationResultFeature.Commands;
using VaccinationManagement.Features.VaccinationResultFeature.Queries;
using VaccinationManagement.Features.VaccineFeature.Queries;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VaccinationResultsController : Controller
    {

        private readonly ApplicationDbContext _context;

        private readonly IMediator _mediator;

        public VaccinationResultsController(ApplicationDbContext context, IMediator mediator)
        {
            _mediator = mediator;
            _context = context;
        }

        // GET: api/VaccinationResult
        /// API Get list VaccinationResult
        // [HttpGet]
        // public async Task<ActionResult<IEnumerable<Injection_Result>>> GetVaccinationResults()
        // {
        //    return Ok(await _mediator.Send(new GetVaccinationResults()));
        // }

        // GET: api/VaccinationResult
        /// API Get list VaccinationResult
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Injection_Result>>> GetVaccinationResults(string? query)
        {
            return Ok(await _mediator.Send(new GetVaccinationResults { query = query }));
        }

        // GET: api/VaccinationResult/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Injection_Result>> GetVaccinationResult(string id)
        {
            var query = new GetVaccinationResultById { Id = id };
            var schedule = await _mediator.Send(query);

            if (schedule == null)
            {
                return NotFound();
            }

            return schedule;
        }

        // GET: api/VaccinationResults/latest
        /// API Get VaccinationResult with highest ID
        [HttpGet("latest")]
        public async Task<ActionResult<Injection_Result>> GetLastVaccinationResult()
        {
            var res = await _mediator.Send(new GetLastVaccinationResult());

            if (res == null)
            {
                return NotFound();
            }

            return res;
        }

        [HttpGet("paged")]
        public async Task<ActionResult<IEnumerable<Injection_Result>>> GetVaccinationResultsWithPagination(int page = 1, int pageSize = 10, string? query = null, ResultStatus? status = null)
        {
            return Ok(await _mediator.Send(new GetVaccinationResultsWithPaginationQuery { Page = page, PageSize = pageSize, query = query, status = status }));
        }
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Injection_Result>>> GetVaccinationResultsFilter([FromQuery] QueryVaccineResultsDTO query)
        {
            return Ok(await _mediator.Send(new GetVaccinationResultsFilterQuery { query = query }));
        }

        [HttpGet("date-range")]
        public async Task<IActionResult> GetDateRange()
        {
            var result = await _mediator.Send(new GetRangeYearQuery());
            return Ok(result);
        }

        [HttpGet("customer")]
        public async Task<IActionResult> GetWithCustomerId(string CustomerId, ResultStatus? Status, int pageIndex = 1, int PageSize = 5, string? SearchQuery = null)
        {
            var result = await _mediator.Send(new GetVaccinationResultsFilterQuery
            {
                query = new QueryVaccineResultsDTO
                {
                    pageIndex = pageIndex,
                    PageSize = PageSize,
                    CustomerId = CustomerId,
                    Status = Status,
                },
                SearchQuery = SearchQuery
            });
            return Ok(result);
        }

        public class UpdateVaccinationStatusQuery : IRequest<ActionResult<Injection_Result>>
        {
            public required string Id { get; set; }
            public ResultStatus? IsVaccinated { get; set; }
        }
        [HttpPut("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateVaccinationStatusQuery query)
        {
            var existingRes = await _context.Injection_Results.Include(res => res.Vaccine).FirstOrDefaultAsync(res => res.Id == query.Id);
            if (existingRes == null)
            {
                return NotFound($"Vaccine Type with Id {query.Id} not found.");
            }

            // +1 for distribution when cancelling result
            if (existingRes.IsVaccinated != ResultStatus.Cancelled && query.IsVaccinated == ResultStatus.Cancelled)
            {
                var distributions = await _mediator.Send(new GetVaccineDistributionsQuery
                {
                    query = new QueryDistributionDTO
                    {
                        VaccineId = existingRes.Vaccine_Id,
                        PlaceId = existingRes.Injection_Place_Id,
                        OrderBy = "DateImport",
                        MinInjectedQuantity = 1,
                        DateRangeStart = existingRes.Vaccine!.Time_Begin_Next_Injection,
                        DateRangeEnd = existingRes.Injection_Date, // The distribution must be imported at a date earlier than the result's injection date
                        PageSize = 1,
                    }
                });

                var dist = await _context.Distributions.FindAsync(distributions.Distributions!.First().Id);

                if (distributions.TotalItems < 1 || dist == null)
                {
                    return NotFound($"Could not find a suitable distribution to return the injection.");
                }

                dist.Quantity_Injected--;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Concurrency issue encountered.");
                }
            }

            existingRes.IsVaccinated = query.IsVaccinated ?? ResultStatus.Injected;
            _context.Entry(existingRes).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Concurrency issue encountered.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVaccinationResult(string id)
        {
            var vaccine_Type = await _context.Injection_Results.FindAsync(id);
            if (vaccine_Type == null)
            {
                return NotFound();
            }

            _context.Injection_Results.Remove(vaccine_Type);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // POST: api/VaccinationResults
        [HttpPost]
        public async Task<ActionResult<Injection_Result>> PostVaccinationResult([FromBody] CreateVaccinationResultQuery query)
        {
            var vac = await _context.Vaccines.FindAsync(query.Vaccine_Id);
            if (vac == null)
            {
                return NotFound($"Vaccine Type with Id {query.Vaccine_Id} not found.");
            }

            var distributions = await _mediator.Send(new GetVaccineDistributionsQuery
            {
                query = new QueryDistributionDTO
                {
                    VaccineId = query.Vaccine_Id,
                    PlaceId = query.Injection_Place_Id,
                    OrderBy = "DateImport",
                    MinQuantity = 1,
                    DateRangeStart = vac.Time_Begin_Next_Injection,
                    DateRangeEnd = query.Injection_Date, // The distribution must be imported at a date earlier than the result's injection date
                    PageSize = 1,
                }
            });

            var dist = await _context.Distributions.FindAsync(distributions.Distributions!.First().Id);

            if (distributions.TotalItems < 1 || dist == null)
            {
                return NotFound($"Selected vaccine is no longer in stock.");
            }

            dist.Quantity_Injected++;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Concurrency issue encountered.");
            }

            var result = await _mediator.Send(query);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            return CreatedAtAction("GetVaccinationResult", new { id = query.Id }, query);
        }

        // PUT: api/VaccinationResults
        [HttpPut]
        public async Task<IActionResult> PutVaccinationResult([FromBody] UpdateVaccinationResultQuery query)
        {
            var result = await _mediator.Send(query);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            if (result.Result is NotFoundResult)
            {
                return NotFound();
            }

            return CreatedAtAction("GetVaccinationResult", new { id = query.Id }, query);
        }

        [HttpGet("get-by-customer-vaccine")]
        public async Task<ActionResult<Injection_Result>> GetVaccinationResultsByCustomerIdAndVaccine(string customerId, string vaccineId)
        {
            var res = await _mediator.Send(new GetVaccinationResultByCustomerNVaccine { CustomerId = customerId, VaccineId = vaccineId });
            if (res == null)
            {
                return NotFound();
            }

            return res;
        }
    }
}
