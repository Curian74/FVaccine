using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineTypeFeature.Queries
{
	public class GetVaccineTypes : IRequest<IEnumerable<Vaccine_Type>>
	{
		public class GetVaccineTypesHandler : IRequestHandler<GetVaccineTypes, IEnumerable<Vaccine_Type>>
		{
			private readonly ApplicationDbContext _context;
			public GetVaccineTypesHandler(ApplicationDbContext context)
			{
				_context = context;
			}

			public async Task<IEnumerable<Vaccine_Type>> Handle(GetVaccineTypes request, CancellationToken cancellationToken)
			{
				var vaccines = await _context.Vaccine_Types
						    .Where(v => v.Status)
							.ToListAsync();
				return vaccines;
			}
		}
	}
}
