using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.EmployeeFeature.Commands
{
    public class UpdateEmployeeStatus : IRequest<bool>
    {
        public List<string> EmployeeIds { get; set; }

        public class UpdateEmployeeStatusHandler : IRequestHandler<UpdateEmployeeStatus, bool>
        {
            private readonly ApplicationDbContext _context;

            public UpdateEmployeeStatusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<bool> Handle(UpdateEmployeeStatus request, CancellationToken cancellationToken)
            {
                // Retrieve all employees with the specified IDs
                var employeesToUpdate = await _context.Employees
                    .Where(v => request.EmployeeIds.Contains(v.Id))
                    .ToListAsync();

                if (employeesToUpdate == null || employeesToUpdate.Count == 0)
                    return false;

                foreach (var emp in employeesToUpdate)
                {
                    emp.Status = !emp.Status;
                    _context.Employees.Update(emp);
                }

                await _context.SaveChangesAsync(cancellationToken);

                return true;
            }
        }
    }
}
