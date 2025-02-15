using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
	public class AnnualVaccineResponse
	{
        public required string VaccineName { get; set; }
        public required int TotalInject{ get; set; }
		public required int TotalInjectionVisits { get; set; }
    }

	public class GetCustomerAnnualVaccineQuery : IRequest<List<AnnualVaccineResponse>>
	{
		public required int Year { get; set; }
		public required string CustomerId { get; set; }

		public class GetCustomerAnnualVaccine : IRequestHandler<GetCustomerAnnualVaccineQuery, List<AnnualVaccineResponse>>
		{
			private readonly ApplicationDbContext _context;
            public GetCustomerAnnualVaccine(ApplicationDbContext context)
            {
                _context = context;
            }
            public async Task<List<AnnualVaccineResponse>> Handle(GetCustomerAnnualVaccineQuery request, CancellationToken cancellationToken)
			{
				int year = request.Year;
				var totalInjectionVisits = await _context.Injection_Results
					.CountAsync(i => i.Customer_Id == request.CustomerId
					&& i.Injection_Date.HasValue && i.Injection_Date.Value.Year ==  year, cancellationToken);
				var result = await _context.Injection_Results
					.Where(i => i.Customer_Id == request.CustomerId &&
					i.Injection_Date.HasValue && i.Injection_Date.Value.Year == year)
					.GroupBy(i => i.Vaccine!.Vaccine_Name)
					.Select(g => new AnnualVaccineResponse
					{
						VaccineName = g.Key,
						TotalInject = g.Sum(i => i.Number_Of_Injection),
						TotalInjectionVisits = totalInjectionVisits
					})
					.ToListAsync(cancellationToken);
				return result;
			}
		}
	}
}
