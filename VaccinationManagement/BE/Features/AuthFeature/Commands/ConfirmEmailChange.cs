using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.AuthFeature.Commands
{
    public class ConfirmEmailChange : IRequest<string>
    {
        public required string Token { get; set; }
        public required string NewEmail { get; set; }

        public class ConfirmEmailChangeHandler : IRequestHandler<ConfirmEmailChange, string>
        {
            private readonly ApplicationDbContext _context;

            public ConfirmEmailChangeHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(
                ConfirmEmailChange request,
                CancellationToken cancellationToken
            )
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(x =>
                    x.EmailChangeToken == request.Token
                );

                if (customer == null || customer.EmailChangeTokenExpiry < DateTime.Now)
                {
                    throw new ArgumentException("Invalid or expired token");
                }

                customer.Email = request.NewEmail;
                customer.EmailChangeToken = null;
                customer.EmailChangeTokenExpiry = null;

                await _context.SaveChangesAsync();

                return customer.Email;
            }
        }
    }
}
