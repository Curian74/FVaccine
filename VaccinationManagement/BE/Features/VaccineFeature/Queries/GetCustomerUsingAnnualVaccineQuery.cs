using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class CustomerUsingAnnualVaccineResponse
    {
        public required int TotalInject { get; set; }
        public required int TotalCustomers { get; set; }
        public required double TotalIncome { get; set; }
    }

    public class GetCustomerUsingAnnualVaccineQuery : IRequest<CustomerUsingAnnualVaccineResponse>
    {
        public required int Year { get; set; }
        public required string VaccineId { get; set; }

        public class GetCustomerAnnualVaccine : IRequestHandler<GetCustomerUsingAnnualVaccineQuery, CustomerUsingAnnualVaccineResponse>
        {
            private readonly ApplicationDbContext _context;
            public GetCustomerAnnualVaccine(ApplicationDbContext context)
            {
                _context = context;
            }
            public async Task<CustomerUsingAnnualVaccineResponse?> Handle(GetCustomerUsingAnnualVaccineQuery request, CancellationToken cancellationToken)
            {
                int year = request.Year;

                var totalCustomers = await _context.Injection_Results
                    .Where(i => i.Vaccine_Id == request.VaccineId
                                && i.Injection_Date.HasValue
                                && i.Injection_Date.Value.Year == year
                                && i.IsVaccinated == ResultStatus.Injected)
                    .Select(i => i.Customer_Id).Distinct()
                    .CountAsync(cancellationToken);

                var result = await _context.Injection_Results
                    .Where(i => i.Vaccine_Id == request.VaccineId &&
                                i.Injection_Date.HasValue &&
                                i.Injection_Date.Value.Year == year
                                && i.IsVaccinated == ResultStatus.Injected)
                    .GroupBy(i => i.Vaccine_Id)
                    .Select(g => new CustomerUsingAnnualVaccineResponse
                    {
                        TotalInject = g.Count(),
                        TotalCustomers = totalCustomers,
                        TotalIncome = g.Sum(v => v.Vaccine!.Selling_Price)
                    })
                    .FirstOrDefaultAsync(cancellationToken);

                return result;
            }

        }
    }
}
