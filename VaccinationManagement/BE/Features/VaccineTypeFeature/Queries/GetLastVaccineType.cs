using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineTypeFeature.Queries
{
	public class GetLastVaccineType : IRequest<ActionResult<Vaccine_Type>>
	{
		public class GetLastVaccineTypeHandler : IRequestHandler<GetLastVaccineType, ActionResult<Vaccine_Type>>
		{
			private readonly ApplicationDbContext _context;
			public GetLastVaccineTypeHandler(ApplicationDbContext context)
			{
				_context = context;
			}

			public async Task<ActionResult<Vaccine_Type>> Handle(GetLastVaccineType request, CancellationToken cancellationToken)
			{
				var vaccine = await _context.Vaccine_Types
							.OrderByDescending(v => v.Id)
							.FirstOrDefaultAsync(cancellationToken);
				return new OkObjectResult(vaccine);
			}
		}
	}
}
