using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.AuthFeature.Queries
{
    public class AccountResponse
    {
        public required string username { get; set; }
        public required string email { get; set; }
        public int roleId { get; set; }
        public string? image { get; set; }
    }
    public class GetAccountByEmail : IRequest<AccountResponse>
    {
        public required string Email { get; set; }

        public class GetAccountByEmailHandler : IRequestHandler<GetAccountByEmail, AccountResponse>
        {
            private readonly ApplicationDbContext _context;

            public GetAccountByEmailHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<AccountResponse> Handle(GetAccountByEmail request, CancellationToken cancellationToken)
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == request.Email, cancellationToken);
                if (employee != null)
                {
                    return new AccountResponse
                    {
                        username = employee.Username,
                        email = employee.Email!,
                        roleId = employee.Role_Id,
                        image = employee?.Image
                    };
                }
                var account = await _context.Customers.FirstOrDefaultAsync(e => e.Email == request.Email, cancellationToken);
                if (account != null)
                {
                    return new AccountResponse
                    {
                        username = account.Username,
                        email = account.Email,
                        roleId = account.Role_Id,
                        image = account?.Image
                    };
                }
                return null;
            }

        }
    }
}
