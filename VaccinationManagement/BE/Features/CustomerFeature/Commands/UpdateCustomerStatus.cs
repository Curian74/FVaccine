using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.CustomerFeature.Commands
{
    public class UpdateCustomerStatus : IRequest<bool>
    {
        public List<string> CustomerIds { get; set; }

        public class UpdateCustomerStatusHandler : IRequestHandler<UpdateCustomerStatus, bool>
        {
            private readonly ApplicationDbContext _context;

            public UpdateCustomerStatusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<bool> Handle(UpdateCustomerStatus request, CancellationToken cancellationToken)
            {
                // Retrieve all customers with the specified IDs
                var customersToUpdate = await _context.Customers
                    .Where(v => request.CustomerIds.Contains(v.Id))
                    .ToListAsync();

                if (customersToUpdate == null || customersToUpdate.Count == 0)
                    return false;

                foreach (var customer in customersToUpdate)
                {
                    customer.Status = !customer.Status;
                    _context.Customers.Update(customer);
                }

                await _context.SaveChangesAsync(cancellationToken);

                return true;
            }
        }
    }
}
