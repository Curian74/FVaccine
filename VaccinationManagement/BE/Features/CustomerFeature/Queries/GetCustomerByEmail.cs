using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class GetCustomerByEmail : IRequest<Customer>
    {
        public required string Email { get; set; }

        public class GetEmployeeByEmailHandler : IRequestHandler<GetCustomerByEmail, Customer>
        {
            private readonly ApplicationDbContext _context;

            public GetEmployeeByEmailHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Customer?> Handle(GetCustomerByEmail request, CancellationToken cancellationToken)
            {
                return await _context.Customers.FirstOrDefaultAsync(c => c.Email == request.Email, cancellationToken);
            }

        }
    }
}
