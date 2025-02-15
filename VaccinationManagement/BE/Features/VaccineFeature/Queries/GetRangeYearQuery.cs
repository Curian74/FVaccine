using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
	public class GetRangeYearVaccineQuery : IRequest<DateRangeResponse>
	{
		public class GetRangeYearHandler : IRequestHandler<GetRangeYearVaccineQuery, DateRangeResponse>
		{
			private readonly ApplicationDbContext _context;
			public GetRangeYearHandler(ApplicationDbContext context)
			{
				_context = context;
			}
			public async Task<DateRangeResponse> Handle(GetRangeYearVaccineQuery request, CancellationToken cancellationToken)
			{

					var minYear = await _context.Vaccines.Where(x => x.Time_Begin_Next_Injection != null)
											.MinAsync(x => x.Time_Begin_Next_Injection!.Value.Year);
					var maxYear = await _context.Vaccines.Where(x => x.Time_Begin_Next_Injection != null)
											.MaxAsync(x => x.Time_Begin_Next_Injection!.Value.Year);
					return new DateRangeResponse
					{
						MinYear = minYear,
						MaxYear = maxYear
					};
			}
		}
	}
}
