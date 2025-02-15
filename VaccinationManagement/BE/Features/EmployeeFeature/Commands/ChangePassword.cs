using Azure.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.EmployeeFeature.Commands
{
    public class ChangePassword : IRequest<Employee>
    {
        public string Id { get; set; } = string.Empty;
        public required string CurrentPassword { get; set; }
        public required string NewPassWord { get; set; }
        public required string ConfirmPassword { get; set; }

        public class ChangePasswordHandler : IRequestHandler<ChangePassword, Employee>
        {
            private readonly ApplicationDbContext _context;

            public ChangePasswordHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Employee> Handle(ChangePassword request, CancellationToken cancellationToken)
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == request.Id);

                if (employee == null)
                {
                    throw new KeyNotFoundException("Employee not found");
                }

                bool isCurrentPassValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, employee.Password);
                
                if (!isCurrentPassValid)
                {
                    throw new UnauthorizedAccessException("Wrong password!");
                }


                if (request.NewPassWord != request.ConfirmPassword)
                {
                    throw new ArgumentException("Passwords must match!");
                }

                bool duplicatePass = BCrypt.Net.BCrypt.Verify(request.NewPassWord, employee.Password);

                if (duplicatePass)
                {
                    throw new ArgumentException("New password must not be the same as the old password!");
                }

                string newHashedPassword = HashPasswordService.HashPassword(request.NewPassWord);

                employee.Password = newHashedPassword;

                _context.Employees.Update(employee);
                await _context.SaveChangesAsync(cancellationToken);

                return employee;
            }


        }
    }
}
