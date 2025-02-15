using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class GetCustomers : IRequest<IEnumerable<Customer>>
    {
        public class GetCustomersHandler : IRequestHandler<GetCustomers, IEnumerable<Customer>>
        {
            private readonly ApplicationDbContext _context;
            public GetCustomersHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Customer>> Handle(GetCustomers request, CancellationToken cancellationToken)
            {
                var list = await _context.Customers.ToListAsync(cancellationToken);
                return list;
            }
        }
    }
}
