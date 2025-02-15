using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
	public class VaccineStatisticResponse
	{
		public required string VaccineName { get; set; }
		public required int TotalInjects { get; set; }
	}

	public class GetVaccineStatisticByYearQuery : IRequest<List<VaccineStatisticResponse>>
	{
		public required int Year { get; set; }

		public class GetVaccineStatisticByYear : IRequestHandler<GetVaccineStatisticByYearQuery, List<VaccineStatisticResponse>>
		{
			private readonly ApplicationDbContext _context;
			public GetVaccineStatisticByYear(ApplicationDbContext context)
			{
				_context = context;
			}
			public async Task<List<VaccineStatisticResponse>> Handle(GetVaccineStatisticByYearQuery request, CancellationToken cancellationToken)
			{
				int year = request.Year;
				var result = await _context.Injection_Results
					.Where(i => i.Injection_Date.HasValue
								&& i.Injection_Date.Value.Year == year)
					.GroupBy(i => i.Vaccine!.Vaccine_Name)
					.Select(g => new VaccineStatisticResponse
					{
						VaccineName = g.Key,
						TotalInjects = g.Sum(i => i.Number_Of_Injection)
                    })
					.ToListAsync(cancellationToken);
				return result;
			}

		}
	}
}
