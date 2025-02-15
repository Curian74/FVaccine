using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class CheckUserExistence : IRequest<CheckUserExistenceResponse>
    {
        public string? Username { get; }
        public string? Email { get; }
        public string? Phone { get; }

        public CheckUserExistence(string username, string email, string phone)
        {
            Username = username;
            Email = email;
            Phone = phone;
        }
        public class CheckUserExistenceHandler : IRequestHandler<CheckUserExistence, CheckUserExistenceResponse>
        {
            private readonly ApplicationDbContext _context;

            public CheckUserExistenceHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<CheckUserExistenceResponse> Handle(CheckUserExistence request, CancellationToken cancellationToken)
            {
                var existingPhone = await _context.Customers.AnyAsync(x => x.Phone == request.Phone) || await _context.Employees.AnyAsync(x => x.Phone == request.Phone);
                var existingEmail = await _context.Customers.AnyAsync(x => x.Email == request.Email) || await _context.Employees.AnyAsync(x => x.Email == request.Email);
                var existingUsername = await _context.Customers.AnyAsync(x => x.Username == request.Username) || await _context.Employees.AnyAsync(x => x.Username == request.Username);

                return new CheckUserExistenceResponse
                {
                    Username = existingUsername ? "The username is already in use." : null,
                    Email = existingEmail ? "The email is already in use." : null,
                    Phone = existingPhone ? "The phone number is already in use." : null
                };
            }
        }
    }

    public class CheckUserExistenceResponse
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}
