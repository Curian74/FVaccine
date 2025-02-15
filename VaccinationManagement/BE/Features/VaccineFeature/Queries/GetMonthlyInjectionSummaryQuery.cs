using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
	public class MonthlyVaccineSummary
	{
		public int Month { get; set; }
		public int TotalVaccines { get; set; }
	}
	public class GetMonthlyVaccineSummaryQuery : IRequest<List<MonthlyVaccineSummary>>
	{
		public int Year { get; set; }

        public GetMonthlyVaccineSummaryQuery(int year)
        {
            Year = year;
        }
        public class GetRangeYearHandler : IRequestHandler<GetMonthlyVaccineSummaryQuery, List<MonthlyVaccineSummary>>
		{
			private readonly ApplicationDbContext _context;
			public GetRangeYearHandler(ApplicationDbContext context)
			{
				_context = context;
			}
			public async Task<List<MonthlyVaccineSummary>> Handle(GetMonthlyVaccineSummaryQuery request, CancellationToken cancellationToken)
			{
				var year = request.Year;

				var monthlySummaries =  Enumerable.Range(1, 12)
					.Select(month => new MonthlyVaccineSummary
					{
						Month = month,
						TotalVaccines = _context.Vaccines
							.Where(i => i.Time_Begin_Next_Injection.HasValue
										&& i.Time_Begin_Next_Injection.Value.Year == year
										&& i.Time_Begin_Next_Injection.Value.Month == month)
							.Sum(i => i.Number_Of_Injection) ?? 0
					})
					.OrderBy(summary => summary.Month)
					.ToList();

				return monthlySummaries;
			}

		}
	}
}
