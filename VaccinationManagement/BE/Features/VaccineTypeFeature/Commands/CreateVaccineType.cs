using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineTypeFeature.Commands
{
	public class CreateVaccineType : IRequest<ActionResult<Vaccine_Type>>
	{
		public required string Id { get; set; }
		public string? Description { get; set; }

		public required string Vaccine_Type_Name { get; set; }

		public string? Image { get; set; }

		public bool Status { get; set; } = true;

		public class CreateVaccineTypeHandler : IRequestHandler<CreateVaccineType, ActionResult<Vaccine_Type>>
		{
			private readonly ApplicationDbContext _context;
			public CreateVaccineTypeHandler(ApplicationDbContext context)
			{
				_context = context;
			}

			public async Task<ActionResult<Vaccine_Type>> Handle(CreateVaccineType request, CancellationToken cancellationToken)
			{
				var vaccine = new Vaccine_Type
				{
					Id = request.Id,
					Vaccine_Type_Name = request.Vaccine_Type_Name,
					Description = request.Description,
					Image = request.Image,
					Status = request.Status,
				};
				_context.Vaccine_Types.Add(vaccine);
				try
				{
					await _context.SaveChangesAsync(cancellationToken);
				}
				catch(DbUpdateException)
				{
					if (VaccineTypeExist(request.Id))
					{
						return  new ConflictResult();
					} 
					else
					{
						throw;
					}
				}
				return new  CreatedAtActionResult("GetVaccine_Type", "VaccineType", new {id = request.Id}, vaccine);
			}

			private bool VaccineTypeExist(string id)
			{
				return _context.Vaccine_Types.Any(t => t.Id == id);
			}
		}

	}
}
