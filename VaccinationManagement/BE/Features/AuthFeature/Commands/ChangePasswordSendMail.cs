using System.Runtime.CompilerServices;
using Azure.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.AuthFeature.Commands
{
    public class ChangePasswordSendMail : IRequest
    {
        public string Id { get; set; } = string.Empty;
        public required string NewPassWord { get; set; }
        public bool IsEmployee { get; set; } = true;

        public class ChangePasswordSendMailHandler : IRequestHandler<ChangePasswordSendMail>
        {
            private readonly ApplicationDbContext _context;

            public ChangePasswordSendMailHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task Handle(
                ChangePasswordSendMail request,
                CancellationToken cancellationToken
            )
            {
                if (request.IsEmployee)
                {
                    var employee = await _context.Employees.FirstOrDefaultAsync(e =>
                        e.Id == request.Id
                    );
                    string newHashedPassword = HashPasswordService.HashPassword(
                        request.NewPassWord
                    );
                    employee!.Password = newHashedPassword;
                    _context.Employees.Update(employee);
                    await _context.SaveChangesAsync(cancellationToken);
                }
                else
                {
                    var customer = await _context.Customers.FirstOrDefaultAsync(c =>
                        c.Id == request.Id
                    );
                    string newHashedPassword = HashPasswordService.HashPassword(
                        request.NewPassWord
                    );
                    customer!.Password = newHashedPassword;
                    _context.Customers.Update(customer);
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
        }
    }
}
