using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.VaccineFeature.Commands;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.CustomerFeature.Commands
{
    public class UpdateCustomer : IRequest<string>
    {
        public required string Id { get; set; }
        public required string Address { get; set; }
        public required string Province { get; set; }
        public required string District { get; set; }
        public required string Ward { get; set; }
        public required DateOnly Date_Of_Birth { get; set; }
        public required string Full_Name { get; set; }
        public /*required*/ string? Email { get; set; }//Temporarily set to nullable
        public int? Gender { get; set; }
        public required string Phone { get; set; }
        public required string Identity_Card { get; set; }
        public /*required*/ string? Password { get; set; } //Temporarily set to nullable.
                                                           //Waiting for Hung's Change password
        public required string Username { get; set; }
        public string? Image { get; set; }
        public bool Status { get; set; }

        public class UpdateCustomerHandler : IRequestHandler<UpdateCustomer, string>
        {
            private readonly ApplicationDbContext _context;

            public UpdateCustomerHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(UpdateCustomer command, CancellationToken cancellationToken)
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == command.Id, cancellationToken);

                if (customer == null)
                {
                    throw new Exception($"Customer with Id {command.Id} not found.");
                }

                customer.Address = command.Address;
                customer.Username = command.Username;
                customer.Phone = command.Phone;
                customer.Identity_Card = command.Identity_Card;
                customer.Date_Of_Birth = command.Date_Of_Birth;
                customer.Gender = command.Gender;
                customer.Email = command.Email!;
                customer.Full_Name = command.Full_Name;
                customer.Status = command.Status;
                customer.Province = command.Province;
                customer.District = command.District;
                customer.Ward = command.Ward;
                customer.Image = command.Image;

                _context.Customers.Update(customer);
                await _context.SaveChangesAsync(cancellationToken);

                return command.Id;
            }
        }

    }
}
