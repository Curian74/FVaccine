using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineTypeFeature.Queries
{
	public class GetVaccineTypeByName : IRequest<ActionResult<Vaccine_Type>>
	{
		public required string Name { get; set; }

		public class GetVaccineTypeByIdHandler : IRequestHandler<GetVaccineTypeByName, ActionResult<Vaccine_Type>>
		{
			private readonly ApplicationDbContext _context;
			public GetVaccineTypeByIdHandler(ApplicationDbContext context)
			{
				_context = context;
			}

			public async Task<ActionResult<Vaccine_Type>> Handle(GetVaccineTypeByName request, CancellationToken cancellationToken)
			{
				var vaccine = await _context.Vaccine_Types
					.FirstOrDefaultAsync(e => e.Vaccine_Type_Name == request.Name);
				if (vaccine == null)
				{
					return new NotFoundResult();
				}
				return new OkObjectResult(vaccine);
			}
		}

	}
}
