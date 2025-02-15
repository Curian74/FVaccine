using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.EmployeeFeature.Queries
{
    public class GetEmployeeById : IRequest<Employee>
    {
        public required string Id { get; set; }

        public class GetEmployeeByIdHandler : IRequestHandler<GetEmployeeById, Employee>
        {
            private readonly ApplicationDbContext _context;

            public GetEmployeeByIdHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Employee> Handle(GetEmployeeById request, CancellationToken cancellationToken)
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == request.Id);

                if (employee == null)
                {
                    return null;
                }

                return employee;
            }
        }
    }
}
