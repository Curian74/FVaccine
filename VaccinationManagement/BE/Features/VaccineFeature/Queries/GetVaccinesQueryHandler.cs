using MediatR;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccinesQueryHandler : IRequestHandler<GetVaccinesQuery, VaccineListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetVaccinesQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<VaccineListResult> Handle(GetVaccinesQuery query, CancellationToken cancellationToken)
        {
            var vaccinesQuery = _context.Vaccines.Include(v => v.Vaccine_Type).AsQueryable();

            //Filtering Status Active
            vaccinesQuery = vaccinesQuery.Where(v => v.Status == query.IsActive);
            
            // Filtering - Case-insensitive search
            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                string normalizedSearchTerm = query.SearchTerm.ToLower().Trim();

                vaccinesQuery = vaccinesQuery.Where(v =>
                    v.Vaccine_Name.ToLower().Contains(normalizedSearchTerm) ||
                    v.Origin.ToLower().Contains(normalizedSearchTerm) ||
                    v.Id.ToLower().Contains(normalizedSearchTerm));
            }

            var totalVaccines = await vaccinesQuery.CountAsync(cancellationToken);

            // Apply pagination
            var vaccines = await vaccinesQuery
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(cancellationToken);

            return new VaccineListResult
            {
                Vaccines = vaccines,
                TotalVaccines = totalVaccines
            };
        }

    }
}
