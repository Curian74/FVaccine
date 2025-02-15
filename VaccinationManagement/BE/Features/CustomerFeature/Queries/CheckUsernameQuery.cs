using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class CheckUsernameQuery : IRequest<bool>
    {
        public string? Username { get; }
        public string? Id { get; set; }

        public CheckUsernameQuery(string? username, string? id)
        {
            Username = username;
            Id = id;
        }
        public class CheckUsernameQueryHandler : IRequestHandler<CheckUsernameQuery, bool>
        {
            private readonly ApplicationDbContext _context;

            public CheckUsernameQueryHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<bool> Handle(CheckUsernameQuery request, CancellationToken cancellationToken)
            {
                var flagResult = false;
                if (!string.IsNullOrEmpty(request.Username))
                {
                    flagResult = await _context.Customers
                    .AnyAsync(x => x.Username == request.Username.Trim() && x.Id != request.Id)
                    || await _context.Employees
                    .AnyAsync(x => x.Username == request.Username.Trim() && x.Id != request.Id);

                    if (flagResult)
                    {
                        throw new ArgumentException("This username is already registered");
                    }
                }

                return flagResult;
            }
        }
    }

}
