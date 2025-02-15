﻿using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
	public class MonthlyInjectionSummary
	{
		public int Month { get; set; }
		public int TotalInjections { get; set; }
        public int TotalNumberVisits { get; set; }
        public double TotalIncome { get; set; }
        public int TotalRevenue { get; set; }
    }
	public class GetMonthlyInjectionSummaryQuery : IRequest<List<MonthlyInjectionSummary>>
	{
		public required int Year { get; set; }
		public string? CustomerId { get; set; }
		public string? VaccineId { get; set; }

        public class GetRangeYearHandler : IRequestHandler<GetMonthlyInjectionSummaryQuery, List<MonthlyInjectionSummary>>
		{
			private readonly ApplicationDbContext _context;
			public GetRangeYearHandler(ApplicationDbContext context)
			{
				_context = context;
			}
			public async Task<List<MonthlyInjectionSummary>> Handle(GetMonthlyInjectionSummaryQuery request, CancellationToken cancellationToken)
			{
				var year = request.Year;

				var monthlySummaries = Enumerable.Range(1, 12)
					.Select(month => new MonthlyInjectionSummary
					{
						Month = month,
						TotalInjections = _context.Injection_Results
							.Where(i => i.Injection_Date.HasValue
										&& i.Injection_Date.Value.Year == year
										&& i.Injection_Date.Value.Month == month
										&& (string.IsNullOrEmpty(request.CustomerId) || request.CustomerId == i.Customer_Id)
										&& (string.IsNullOrEmpty(request.VaccineId) || request.VaccineId == i.Vaccine_Id)
										&& i.IsVaccinated == Models.ResultStatus.Injected)
                            .Count(),

						TotalNumberVisits = _context.Injection_Results
							.Where(i => i.Injection_Date.HasValue
										&& i.Injection_Date.Value.Year == year
										&& i.Injection_Date.Value.Month == month
										&& (string.IsNullOrEmpty(request.CustomerId) || request.CustomerId == i.Customer_Id)
										&& (string.IsNullOrEmpty(request.VaccineId) || request.VaccineId == i.Vaccine_Id)
										&& i.IsVaccinated == Models.ResultStatus.Injected)
							.Count(),

                        TotalIncome = _context.Injection_Results
                            .Where(i => i.Injection_Date.HasValue
                                        && i.Injection_Date.Value.Year == year
                                        && i.Injection_Date.Value.Month == month
                                        && (string.IsNullOrEmpty(request.CustomerId) || request.CustomerId == i.Customer_Id)
                                        && (string.IsNullOrEmpty(request.VaccineId) || request.VaccineId == i.Vaccine_Id)
										&& i.IsVaccinated == ResultStatus.Injected)
                            .Sum(v => v.Vaccine!.Selling_Price),

                        TotalRevenue = _context.Injection_Results
                            .Include(i => i.Vaccine)
                            .Where(i => i.Injection_Date.HasValue
                                        && i.Injection_Date.Value.Year == year
                                        && i.Injection_Date.Value.Month == month
                                        && (string.IsNullOrEmpty(request.CustomerId) || request.CustomerId == i.Customer_Id)
                                        && (string.IsNullOrEmpty(request.VaccineId) || request.VaccineId == i.Vaccine_Id)
                                        && i.IsVaccinated == Models.ResultStatus.Injected)
                            .Sum(i => i.Vaccine!.Selling_Price)
					})
					.OrderBy(summary => summary.Month)
					.ToList();

				return monthlySummaries;
			}


		}
	}
}
