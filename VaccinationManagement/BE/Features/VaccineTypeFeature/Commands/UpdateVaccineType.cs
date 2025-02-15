using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineTypeFeature.Commands
{
	public class UpdateVaccineType : IRequest<ActionResult<Vaccine_Type>>
	{
		public required string Id { get; set; }
		public string? Description { get; set; }

		public required string Vaccine_Type_Name { get; set; }

		public string? Image { get; set; }

		public bool Status { get; set; } = true;

		public class UpdateVaccineTypeHandler : IRequestHandler<UpdateVaccineType, ActionResult<Vaccine_Type>>
		{
			private readonly ApplicationDbContext _context;
			public UpdateVaccineTypeHandler(ApplicationDbContext context)
			{
				_context = context;
			}

			public async Task<ActionResult<Vaccine_Type>> Handle(UpdateVaccineType request, CancellationToken cancellationToken)
			{
				var vaccine = await _context.Vaccine_Types.FindAsync(request.Id);
				if (vaccine == null)
				{
					return new NotFoundResult();
				}

				vaccine.Vaccine_Type_Name = request.Vaccine_Type_Name;
				vaccine.Description = request.Description;
				vaccine.Image = request.Image;
				vaccine.Status = request.Status;

				try
				{
					await _context.SaveChangesAsync(cancellationToken);
				}
				catch (DbUpdateException)
				{
					throw;  // You can remove the conflict check entirely
				}

				return new CreatedAtActionResult("GetVaccine_Type", "VaccineType", new { id = request.Id }, vaccine);
			}

		}

	}
}
