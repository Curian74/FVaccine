using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.EmployeeFeature.Queries
{
    public class GetEmployeeByEmail : IRequest<Employee>
    {
        public required string Email { get; set; }

        public class GetEmployeeByEmailHandler : IRequestHandler<GetEmployeeByEmail, Employee>
        {
            private readonly ApplicationDbContext _context;

            public GetEmployeeByEmailHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Employee?> Handle(GetEmployeeByEmail request, CancellationToken cancellationToken)
            {
                return await _context.Employees.FirstOrDefaultAsync(e => e.Email == request.Email, cancellationToken);
            }

        }
    }
}
