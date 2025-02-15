using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccineDistributions : IRequest<IEnumerable<Distribution>>
    {
        public class GetVaccineDistributionsHandler : IRequestHandler<GetVaccineDistributions, IEnumerable<Distribution>>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccineDistributionsHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Distribution>> Handle(GetVaccineDistributions request, CancellationToken cancellationToken)
            {
                var list = await _context.Distributions
                    .Include(d => d.Vaccine)  
                    .Include(d => d.Place)  
                    .ToListAsync();
                return list;
            }
        }
    }
}
