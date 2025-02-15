using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class GetLastCustomer : IRequest<Customer>
    {
        public class GetLastCustomerHandler : IRequestHandler<GetLastCustomer, Customer>
        {
            private readonly ApplicationDbContext _context;
            public GetLastCustomerHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Customer> Handle(GetLastCustomer request, CancellationToken cancellationToken)
            {
                var customer = await _context.Customers
                    .OrderByDescending(v => v.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (customer == null)
                {
                    return new Customer
                    {
                        Id = "Null",
                        Address = "Null",
                        Phone = "Null",
                        Username = "Null",
                        Password = "Password",
                        Full_Name = "Null",
                        Email = "Null",
                        Date_Of_Birth = DateOnly.Parse("2000-01-01"),
                        Identity_Card = "Null",
                        Province = "Null",
                        District = "Null",
                        Ward = "Null"
                    };
                }

                return customer;
            }
        }
    }
}
