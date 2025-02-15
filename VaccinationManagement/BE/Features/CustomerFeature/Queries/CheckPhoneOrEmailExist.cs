using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class CheckPhoneOrEmailExist : IRequest<bool>
    {
        public string? Email { get; }
        public string? Phone { get; }
        public string? Id { get; set; }

        public CheckPhoneOrEmailExist(string? email, string? phone, string? id)
        {
            Email = email;
            Phone = phone;
            Id = id;
        }
        public class CheckPhoneOrEmailExistHandler : IRequestHandler<CheckPhoneOrEmailExist, bool>
        {
            private readonly ApplicationDbContext _context;

            public CheckPhoneOrEmailExistHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<bool> Handle(CheckPhoneOrEmailExist request, CancellationToken cancellationToken)
            {
                var flagResult = false;
                if (!string.IsNullOrEmpty(request.Phone))
                {
                    flagResult = (await _context.Customers.AnyAsync(x => x.Phone == request.Phone && x.Id != request.Id)
                               || await _context.Employees.AnyAsync(x => x.Phone == request.Phone
                               && x.Id != request.Id));
                    if (flagResult)
                    {
                        throw new ArgumentException("This phone is already registered");
                    }
                }
                if (!string.IsNullOrEmpty(request.Email))
                {
                    flagResult = await _context.Customers.AnyAsync(x => x.Email == request.Email)
                               || await _context.Employees.AnyAsync(x => x.Email == request.Email);
                    if (flagResult)
                    {
                        throw new ArgumentException("This email is already registered");
                    }
                }

                return flagResult;
            }
        }
    }

}
