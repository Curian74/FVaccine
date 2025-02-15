using MediatR;
using Microsoft.AspNetCore.Mvc;
using VaccinationManagement.Features.PlaceFeature.Queries;
using VaccinationManagement.Features.PlaceFeature.Commands;
using VaccinationManagement.Models;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlacesController : Controller
    {
        private readonly IMediator _mediator;

        public PlacesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/Place
        /// API Get list Place
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Place>>> GetPlaces(string? query, bool? active = true)
        {
            return Ok(await _mediator.Send(new GetPlaces() { query = query, status = active }));
        }

        // GET: api/Place?id={id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Place>> GetPlace(string id)
        {
            var query = new GetPlaceById { Id = id };
            var place = await _mediator.Send(query);

            if (place == null)
            {
                return NotFound();
            }

            return place;
        }

        // GET: api/Places/latest
        /// API Get Place with highest ID
        [HttpGet("latest")]
        public async Task<ActionResult<Place>> GetLastPlace()
        {
            var schedule = await _mediator.Send(new GetLastPlace());

            if (schedule == null)
            {
                return NotFound();
            }

            return schedule;
        }

        // GET: api/Places/paged?page={page}&pageSize={pageSize}
        /// API Get paged Places
        [HttpGet("paged")]
        public async Task<ActionResult<Places_Paged>> GetPlacesWithPagination(int page = 1, int pageSize = 10, string? query = null, bool? active = null, bool exact = false)
        {
            return Ok(await _mediator.Send(new GetPlacesWithPaginationQuery
            {
                Page = page,
                PageSize = pageSize,
                query = query,
                status = active,
                exact = exact
            }));
        }


        // POST: api/Places
        [HttpPost]
        public async Task<ActionResult<Place>> PostPlace([FromBody] CreatePlaceQuery place)
        {
            var result = await _mediator.Send(place);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            return CreatedAtAction("GetPlace", new { id = place.Id }, place);
        }

        // PUT: api/Places
        [HttpPut]
        public async Task<IActionResult> PutPlace([FromBody] UpdatePlaceQuery place)
        {
            var result = await _mediator.Send(place);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            if (result.Result is NotFoundResult)
            {
                return NotFound();
            }

            return CreatedAtAction("GetPlace", new { id = place.Id }, place);
        }

        // PUT: api/Places/list
        [HttpPut("list")]
        public async Task<IActionResult> PutPlaces([FromBody] UpdatePlacesQuery places)
        {
            var unsuccessfulOperations = await _mediator.Send(places);
            if (unsuccessfulOperations.Count() > 0)
            {
                return Conflict(unsuccessfulOperations);
            }

            return Ok();
        }
    }
}
