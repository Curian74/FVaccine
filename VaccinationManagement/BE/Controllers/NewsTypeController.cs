using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using VaccinationManagement.Data;
using VaccinationManagement.Features.NewsTypeFeature.Commands;
using VaccinationManagement.Features.NewsTypeFeature.Queries;
namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsTypeController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IMediator _mediator;

        public NewsTypeController(ApplicationDbContext context, IMediator mediator)
        {
            _context = context;
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetNewsTypes([FromQuery] GetNewsType query)
        {
            var newsTypeList = await _mediator.Send(query);
            return Ok(newsTypeList);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetAllActive()
        {
            return Ok(await _mediator.Send(new GetActiveNewsTypes()));
        }

        [HttpPut("change-status")]
        public async Task<IActionResult> ChangeStatus([FromBody] ChangeNewsTypesStatus command)
        {
            try
            {
                var updatedNewsType = await _mediator.Send(command);
                return Ok(updatedNewsType);
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

        [HttpPut("update")]
        public async Task<IActionResult> UpdateNewsTypes([FromBody] UpdateNewsType command)
        {
            try
            {
                var updatedNewsType = await _mediator.Send(command);
                return Ok(updatedNewsType);
            }

            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
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

        [HttpPost]
        public async Task<IActionResult> AddNewsType(CreateNewsType command)
        {
            try
            {
                var newNewsType = await _mediator.Send(command);

                if (newNewsType == null)
                {
                    return BadRequest("Error");
                }

                return Ok(newNewsType);
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
