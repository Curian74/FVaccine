using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
	public class DateRangeResponse
	{
		public int MinYear { get; set; }
		public int MaxYear { get; set; }
	}
	public class GetRangeYearQuery : IRequest<DateRangeResponse>
	{
		public class GetRangeYearHandler : IRequestHandler<GetRangeYearQuery, DateRangeResponse>
		{
			private readonly ApplicationDbContext _context;
			public GetRangeYearHandler(ApplicationDbContext context)
			{
				_context = context;
			}
			public async Task<DateRangeResponse> Handle(GetRangeYearQuery request, CancellationToken cancellationToken)
			{

					var minYear = await _context.Injection_Results.Where(x => x.Injection_Date != null)
											.MinAsync(x => x.Injection_Date!.Value.Year);
					var maxYear = await _context.Injection_Results.Where(x => x.Injection_Date != null)
											.MaxAsync(x => x.Injection_Date!.Value.Year);
					return new DateRangeResponse
					{
						MinYear = minYear,
						MaxYear = maxYear
					};
			}
		}
	}
}
