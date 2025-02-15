using MediatR;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class GetCustomersQueryHandler : IRequestHandler<GetCustomersQuery, CustomerListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetCustomersQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CustomerListResult> Handle(GetCustomersQuery query, CancellationToken cancellationToken)
        {
            var customersQuery = _context.Customers.AsQueryable();

            //Filtering Status Active
            customersQuery = customersQuery.Where(v => v.Status == query.IsActive);

            // Filtering - Case-insensitive search
            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                string normalizedSearchTerm = query.SearchTerm.ToLower().Trim();

                customersQuery = customersQuery.Where(v =>
                    v.Full_Name.ToLower().Contains(normalizedSearchTerm) ||
                    v.Phone.ToLower().Contains(normalizedSearchTerm) ||
                    v.Address.ToLower().Contains(normalizedSearchTerm) ||
                    v.Date_Of_Birth.ToString().Contains(normalizedSearchTerm) ||
                    v.Identity_Card.ToLower().Contains(normalizedSearchTerm) ||
                    v.Id.ToLower().Contains(normalizedSearchTerm));
            }

            var totalCustomers = await customersQuery.CountAsync(cancellationToken);

            // Apply pagination
            var Customers = await customersQuery
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(cancellationToken);

            return new CustomerListResult
            {
                Customers = Customers,
                TotalCustomers = totalCustomers
            };
        }

    }
}
