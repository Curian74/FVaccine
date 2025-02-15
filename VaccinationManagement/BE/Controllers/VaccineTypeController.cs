using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.VaccineTypeFeature.Commands;
using VaccinationManagement.Features.VaccineTypeFeature.Queries;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class VaccineTypeController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		private readonly IWebHostEnvironment _env;

		private readonly IMediator _mediator;

		public VaccineTypeController(ApplicationDbContext context, IMediator mediator, IWebHostEnvironment env)
		{
			_context = context;
			_mediator = mediator;
			_env = env;
		}

		// GET: api/VaccineType
		[HttpGet]
		public async Task<ActionResult<Vaccine_Type>> GetVaccine_Types()
		{
			var result = await _mediator.Send(new GetVaccineTypes());
			return Ok(result);
		}
		// GET: api/VaccineType
		[HttpGet("page")]
		public async Task<ActionResult<PaginatedVaccineTypePageResponse>> GetVaccine_TypePage([FromQuery] string? searchTerm, [FromQuery] int? pageIndex, [FromQuery] int? pageSize, [FromQuery] bool isActive)
		{
			var query = new GetVaccineTypesPage
			{
				SearchTerm = searchTerm,
				PageIndex = pageIndex,
				PageSize = pageSize,
				IsActive = isActive
			};

			var result = await _mediator.Send(query);

			return Ok(result);
		}


		// GET: api/VaccineType/5
		[HttpGet("{id}")]
		public async Task<ActionResult<Vaccine_Type>> GetVaccine_Type(string id)
		{
			var query = new GetVaccineTypeById { Id = id };
			var vaccine_Type = await _mediator.Send(query);

			if (vaccine_Type == null)
			{
				return NotFound();
			}

			return vaccine_Type;
		}

		[HttpGet("name/{name}")]
		public async Task<ActionResult<Vaccine_Type>> GetVaccine_TypeByName(string name)
		{
			var query = new GetVaccineTypeByName { Name = name };
			var vaccine_Type = await _mediator.Send(query);

			if (vaccine_Type == null)
			{
				return NotFound();
			}

			return vaccine_Type;
		}


		[HttpGet("last-vaccine-type")]
		public async Task<ActionResult<Vaccine_Type>> GetLastVaccine_Type()
		{
			var vaccine_Type = await _mediator.Send(new GetLastVaccineType());
			return vaccine_Type;
		}

		// PUT: api/VaccineType
		[HttpPut]
		public async Task<IActionResult> PutVaccine_Type([FromBody] UpdateVaccineType vaccine_Type)
		{
			var result = await _mediator.Send(vaccine_Type);
			if (result.Result is ConflictResult)
			{
				return Conflict();
			}
			if (result.Result is NotFoundResult)
			{
				return NotFound();
			}

			return NoContent();
		}

		[HttpPut("make-inactive")]
		public async Task<IActionResult> MakeInactiveVaccineTypes([FromBody] List<Vaccine_Type> vaccine_Types)
		{
			foreach (var vaccine_type in vaccine_Types)
			{
				var existingVaccine = await _context.Vaccine_Types.FindAsync(vaccine_type.Id);
				if (existingVaccine == null)
				{
					return NotFound($"Vaccine Type with Id {vaccine_type.Id} not found.");
				}

				existingVaccine.Status = vaccine_type.Status;
				_context.Entry(existingVaccine).State = EntityState.Modified;
			}

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


		// POST: api/VaccineType
		[HttpPost]
		public async Task<ActionResult<Vaccine_Type>> PostVaccine_Type([FromBody] CreateVaccineType vaccine_Type)
		{
			var result = await _mediator.Send(vaccine_Type);
			if (result.Result is ConflictResult)
			{
				return Conflict();
			}
			return CreatedAtAction("GetVaccine_Type", new { id = vaccine_Type.Id }, vaccine_Type);
		}

		// DELETE: api/VaccineType/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteVaccine_sType(string id)
		{
			var vaccine_Type = await _context.Vaccine_Types.FindAsync(id);
			if (vaccine_Type == null)
			{
				return NotFound();
			}

			_context.Vaccine_Types.Remove(vaccine_Type);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		[ApiExplorerSettings(IgnoreApi = true)]
		[HttpPost("upload-image")]
		public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
		{
			if (file == null || file.Length == 0)
			{
				return BadRequest("No file uploaded.");
			}

			var uploadsFolder = Path.Combine(_env.WebRootPath, "Uploads/VaccineTypes");
			if (!Directory.Exists(uploadsFolder))
			{
				Directory.CreateDirectory(uploadsFolder);
			}

			var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
			var filePath = Path.Combine(uploadsFolder, uniqueFileName);

			using (var stream = new FileStream(filePath, FileMode.Create))
			{
				await file.CopyToAsync(stream);
			}

			var imageUrl = $"/uploads/VaccineTypes/{uniqueFileName}";
			return Ok(new { path = imageUrl });
		}

	}
}
