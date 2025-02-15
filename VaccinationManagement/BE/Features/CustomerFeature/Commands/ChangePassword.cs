using Azure.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.CustomerFeature.Commands
{
    public class ChangePasswordCustomer : IRequest<Customer>
    {
        public required string Id { get; set; }
        public required string CurrentPassword { get; set; }
        public required string NewPassWord { get; set; }
        public required string ConfirmPassword { get; set; }

        public class ChangePasswordHandler : IRequestHandler<ChangePasswordCustomer, Customer>
        {
            private readonly ApplicationDbContext _context;

            public ChangePasswordHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Customer> Handle(ChangePasswordCustomer request, CancellationToken cancellationToken)
            {
                try
                {
                    var customer = await _context.Customers.FirstOrDefaultAsync(e => e.Id == request.Id);

                    if (customer == null)
                    {
                        throw new KeyNotFoundException("Customer not found");
                    }

                    bool isCurrentPassValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, customer.Password);

                    if (!isCurrentPassValid)
                    {
                        throw new UnauthorizedAccessException("Wrong password!");
                    }

                    if (request.NewPassWord != request.ConfirmPassword)
                    {
                        throw new ArgumentException("Passwords must match!");
                    }

                    bool duplicatePass = BCrypt.Net.BCrypt.Verify(request.NewPassWord, customer.Password);

                    if (duplicatePass)
                    {
                        throw new ArgumentException("New password must not be the same as the old password!");
                    }

                    string newHashedPassword = HashPasswordService.HashPassword(request.NewPassWord);

                    customer.Password = newHashedPassword;

                    _context.Customers.Update(customer);
                    await _context.SaveChangesAsync(cancellationToken);

                    return customer;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error: {ex.Message}");
                    throw;
                }
            }


        }
    }
}
