using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetAllVaccineList : IRequest<VaccineListResult>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 5;
        public string? SearchTerm { get; set; }

        public class GetAllVaccineListHandler : IRequestHandler<GetAllVaccineList, VaccineListResult>
        {
            private readonly ApplicationDbContext _context;

            public GetAllVaccineListHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<VaccineListResult> Handle(GetAllVaccineList request, CancellationToken cancellationToken)
            {
                var vaccinesQuery = _context.Vaccines.Include(v => v.Vaccine_Type).AsQueryable();

                if(!string.IsNullOrEmpty(request.SearchTerm))
                {
                    vaccinesQuery = _context.Vaccines
                        .Where(x => x.Vaccine_Name.Contains(request.SearchTerm.Trim()));
                }

                var totalVaccines = await vaccinesQuery.CountAsync(cancellationToken);

                var vaccines = await vaccinesQuery
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync(cancellationToken);

                return new VaccineListResult
                {
                    TotalVaccines = totalVaccines,
                    Vaccines = vaccines
                };
            }
        }
    }
}
