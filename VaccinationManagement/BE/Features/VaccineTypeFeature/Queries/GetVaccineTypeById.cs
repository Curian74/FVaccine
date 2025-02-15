using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineTypeFeature.Queries
{
	public class GetVaccineTypeById : IRequest<ActionResult<Vaccine_Type>>
	{
		public required string Id { get; set; }

		public class GetVaccineTypeByIdHandler : IRequestHandler<GetVaccineTypeById, ActionResult<Vaccine_Type>>
		{
			private readonly ApplicationDbContext _context;
			public GetVaccineTypeByIdHandler(ApplicationDbContext context)
			{
				_context = context;
			}

			public async Task<ActionResult<Vaccine_Type>> Handle(GetVaccineTypeById request, CancellationToken cancellationToken)
			{
				var vaccine = await _context.Vaccine_Types.FindAsync(request.Id);
				if (vaccine == null)
				{
					return new NotFoundResult();
				}
				return new OkObjectResult(vaccine);
			}
		}

	}
}
