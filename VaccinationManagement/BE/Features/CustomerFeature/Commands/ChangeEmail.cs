using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.EmailFeature.Command;

namespace VaccinationManagement.Features.CustomerFeature.Commands
{
    public class ChangeEmail : IRequest<string>
    {
        public required string OldEmail { get; set; }
        public required string NewEmail { get; set; }

        public class ChangeEmailHandler : IRequestHandler<ChangeEmail, string>
        {
            const int TOKEN_EXPIRY_MINUTE = 5;
            private readonly ApplicationDbContext _context;
            private readonly SendEmailCommandHandler _sendEmailHandler;

            public ChangeEmailHandler(ApplicationDbContext context, SendEmailCommandHandler sendEmailHandler)
            {
                _context = context;
                _sendEmailHandler = sendEmailHandler;
            }

            public async Task<string> Handle(ChangeEmail request, CancellationToken cancellationToken)
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(x => x.Email == request.OldEmail);

                if (customer == null)
                {
                    throw new KeyNotFoundException("Customer not found");
                }

                var isEmailExist = await _context.Customers.AnyAsync(x => x.Email == request.NewEmail)
                                || await _context.Employees.AnyAsync(x => x.Email == request.NewEmail);

                if (isEmailExist)
                {
                    throw new ArgumentException("Error! This email is already registered");
                }

                var token = Guid.NewGuid().ToString();
                customer.EmailChangeToken = token;
                customer.EmailChangeTokenExpiry = DateTime.Now.AddMinutes(TOKEN_EXPIRY_MINUTE);

                await _context.SaveChangesAsync();

                var confirmationLink = $"http://localhost:5070/api/Customer/confirm-email?token={token}&newEmail={request.NewEmail}";

                var content = $@"
                <p>We received a request for changing your email address</p>
                <p>The link will expire after <strong>{TOKEN_EXPIRY_MINUTE} minutes</strong> </p>
                <p>Please confirm your email change by clicking the link below:</p>
                <a href='{confirmationLink}'>Confirm Email</a>";

                var emailCommand = new SendEmailCommand
                {
                    ToEmail = request.NewEmail,
                    Subject = "Confirm Your Email Change",
                    Body = content
                };

                var emailSent = await _sendEmailHandler.Handle(emailCommand);
                if (!emailSent)
                {
                    throw new Exception("Failed to send confirmation email");
                }

                return request.NewEmail;
            }
        }
    }
}
