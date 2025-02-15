using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineTypeFeature.Queries
{
    public class PaginatedVaccineTypePageResponse
    {
        public int PageIndex { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }
        public List<Vaccine_Type>? Items { get; set; }
    }

    public class GetVaccineTypesPage : IRequest<PaginatedVaccineTypePageResponse>
    {
        public string? SearchTerm { get; set; }
        public int? PageIndex { get; set; } = 1;
        public int? PageSize { get; set; } = 5;
        public bool IsActive { get; set; } = true;

        public class GetVaccineTypesHandler : IRequestHandler<GetVaccineTypesPage, PaginatedVaccineTypePageResponse>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccineTypesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<PaginatedVaccineTypePageResponse> Handle(GetVaccineTypesPage request, CancellationToken cancellationToken)
            {
                var query = _context.Vaccine_Types.AsQueryable();
                query = query.Where(v => v.Status == request.IsActive);

                if (!string.IsNullOrEmpty(request.SearchTerm))
                {
                    query = query.Where(v =>
                        v.Vaccine_Type_Name.Contains(request.SearchTerm) ||
                        v.Description!.Contains(request.SearchTerm));
                }
                if (request.PageIndex == null || request.PageSize == null)
                {
                    var items = await query
                        .OrderByDescending(x => x.Status)
                        .ThenBy(x => x.Id)
                        .ToListAsync();

                    return new PaginatedVaccineTypePageResponse
                    {
                        PageIndex = 1,
                        TotalPages = 1,
                        Items = items
                    };
                }
                else
                {
                    var count = await query.CountAsync();
                    var items = await query
                        .OrderByDescending(x => x.Status)
                        .ThenBy(x => x.Id)
                        .Skip((request.PageIndex.Value - 1) * request.PageSize.Value)
                        .Take(request.PageSize.Value)
                        .ToListAsync();

                    var totalPages = (int)Math.Ceiling(count / (double)request.PageSize.Value);

                    return new PaginatedVaccineTypePageResponse
                    {
                        PageIndex = request.PageIndex.Value,
                        TotalPages = totalPages,
                        Items = items,
                        TotalItems = count
                    };
                }
            }

        }
    }
}
