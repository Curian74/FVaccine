using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using VaccinationManagement.Data;
using VaccinationManagement.Features.NewsFeature.Queries;
using VaccinationManagement.Features.PositionFeature.Commands;
using VaccinationManagement.Features.PositionFeature.Queries;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PositionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMediator _mediator;

        public PositionController(ApplicationDbContext context, IMediator mediator)
        {
            _context = context;
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] GetPositions query)
        {
            var positionsListResult = await _mediator.Send(query);
            return Ok(positionsListResult);
        }

        [HttpGet("/api/Position-active")]
        public async Task<IActionResult> GetAllActive()
        {
            return Ok(await _mediator.Send(new GetAllActivePositions()));
        }

        [HttpPut("change-status")]
        public async Task<IActionResult> ChangeStatus([FromBody]ChangePositionStatus command)
        {
            try
            {
                var updatedPosition = await _mediator.Send(command);
                return Ok(updatedPosition);
            }

            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }

            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var position = await _mediator.Send(new GetPositionById { Id = id });

            if (position == null)
            {
                return BadRequest("Position not found!");
            }

            return Ok(position);
        }

        [HttpPost]
        public async Task<IActionResult> AddPosition(CreatePosition position)
        {
            try
            {
                var newPosition = await _mediator.Send(position);

                if (newPosition == null)
                {
                    return BadRequest("Error");
                }

                return Ok(newPosition);
            }
            catch (DuplicateNameException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }

        [HttpGet("next-id")]
        public ActionResult<string>? GetNextPositionId()
        {
            var latestId = _context.Employees.Max(x => x.Id);

            if (latestId == null)
            {
                return "PO000001";
            }

            IDFormatter idFormatter = new();
            var nextId = idFormatter.NewId(latestId);

            return Ok(nextId);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdatePosition([FromBody] UpdatePosition command)
        {
            try
            {
                var updatedPosition = await _mediator.Send(command);
                return Ok(updatedPosition);
            }

            catch(ArgumentException ex)
            {
                return NotFound(new {message = ex.Message});
            }

            catch (DuplicateNameException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }
    }
}
