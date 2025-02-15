using MediatR;
using Microsoft.AspNetCore.Mvc;
using VaccinationManagement.Features.ScheduleFeature.Queries;
using VaccinationManagement.Features.ScheduleFeature.Commands;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : Controller
    {
        private readonly IMediator _mediator;

        public SchedulesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/Schedule
        /// API Get list Schedule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Injection_Schedule>>> GetSchedules(string? query)
        {
            return Ok(await _mediator.Send(new GetSchedules() { query = query }));
        }

        // GET: api/VaccineType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Injection_Schedule>> GetSchedule(string id)
        {
            var query = new GetScheduleById { Id = id };
            var schedule = await _mediator.Send(query);

            if (schedule == null)
            {
                return NotFound();
            }

            return schedule;
        }

        // GET: api/Schedules/latest
        /// API Get Schedule with highest ID
        [HttpGet("latest")]
        public async Task<ActionResult<Injection_Schedule>> GetLastSchedule()
        {
            var schedule = await _mediator.Send(new GetLastSchedule());

            if (schedule == null)
            {
                return NotFound();
            }

            return schedule;
        }

        // GET: api/Schedules/paged?page={page}&pageSize={pageSize}
        /// API Get paged Schedules
        [HttpGet("paged")]
        public async Task<ActionResult<Injection_Schedules_Paged>> GetSchedulesWithPagination([FromQuery] QueryScheduleDTO query, string? SearchQuery = null)
        {
            return Ok(await _mediator.Send(new GetSchedulesWithPaginationQuery { query = query, SearchQuery = SearchQuery }));
        }


        [HttpGet("paged/notyet")]
        public async Task<ActionResult<Injection_Schedules_Paged>> GetEarlySchedulesWithPagination([FromQuery] QueryScheduleDTO query, string? SearchQuery = null)
        {
            query.Status = ScheduleStatus.NotYet;
            return Ok(await _mediator.Send(new GetSchedulesWithPaginationQuery { query = query, SearchQuery = SearchQuery }));
        }

        [HttpGet("paged/open")]
        public async Task<ActionResult<Injection_Schedules_Paged>> GetOpenSchedulesWithPagination([FromQuery] QueryScheduleDTO query, string? SearchQuery = null)
        {
            query.Status = ScheduleStatus.Open;
            return Ok(await _mediator.Send(new GetSchedulesWithPaginationQuery { query = query, SearchQuery = SearchQuery }));
        }

        [HttpGet("paged/over")]
        public async Task<ActionResult<Injection_Schedules_Paged>> GetLateSchedulesWithPagination([FromQuery] QueryScheduleDTO query, string? SearchQuery = null)
        {
            query.Status = ScheduleStatus.Over;
            return Ok(await _mediator.Send(new GetSchedulesWithPaginationQuery { query = query, SearchQuery = SearchQuery }));
        }


        // POST: api/Schedules
        [HttpPost]
        public async Task<ActionResult<Injection_Schedule>> PostSchedule([FromBody] CreateScheduleQuery schedule)
        {
            var result = await _mediator.Send(schedule);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            return CreatedAtAction("GetSchedule", new { id = schedule.Id }, schedule);
        }

        // PUT: api/Schedules
        [HttpPut]
        public async Task<IActionResult> PutSchedule([FromBody] UpdateScheduleQuery schedule)
        {
            var result = await _mediator.Send(schedule);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            if (result.Result is NotFoundResult)
            {
                return NotFound();
            }

            return CreatedAtAction("GetSchedule", new { id = schedule.Id }, schedule);
        }

        [HttpGet("get-by-vaccineId")]
        public async Task<ActionResult<IEnumerable<Injection_Schedule>>> GetSchedulesByVaccineId([FromQuery] QueryGetSchedulesByVaccineIdDTO query)
        {
            return Ok(await _mediator.Send(new GetSchedulesByVaccineIdQuery
            {
               query = query
            }));
        }
    }
}
