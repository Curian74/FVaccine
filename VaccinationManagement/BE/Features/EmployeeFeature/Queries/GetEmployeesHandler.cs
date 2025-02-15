using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.EmployeeFeature.Queries
{
    public class GetEmployeesHandler : IRequestHandler<GetEmployees, EmployeeListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetEmployeesHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<EmployeeListResult> Handle(GetEmployees request, CancellationToken cancellationToken)
        {
            // Build the query
            var query = _context.Employees.AsQueryable();

            // Apply filtering based on search query
            if (!string.IsNullOrEmpty(request.Name))
            {
                query = query.Where(e => e.Employee_Name.Contains(request.Name.Trim()));
            }

            // Filter based on status
            query = query.Where(e => e.Status == request.Status);

            // Calculate total count before applying pagination
            var totalEmployee = await query.CountAsync(cancellationToken);

            // Apply pagination
            var skip = (request.PageIndex - 1) * request.PageSize;
            var employees = await query.Skip(skip).Take(request.PageSize).ToListAsync(cancellationToken);

            return new EmployeeListResult
            {
                Employees = employees,
                TotalEmployees = totalEmployee
            };
        }

    }
}
