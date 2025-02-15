using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
    public class GetVaccinationResultsWithPaginationQuery : IRequest<Injection_Results_Paged>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public string? query { get; set; }
        public ResultStatus? status { get; set; }
    }

    public class GetVaccinationResultsWithPagination : IRequest<Injection_Results_Paged>
    {
        public class GetVaccinationResultHandler : IRequestHandler<GetVaccinationResultsWithPaginationQuery, Injection_Results_Paged>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccinationResultHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Injection_Results_Paged> Handle(GetVaccinationResultsWithPaginationQuery request, CancellationToken cancellationToken)
            {
                var list = GetVaccinationResults.IncludeVaccineWithoutCausingALoop(_context.Injection_Results);

                if (request.status != null)
                {
                    list = list.Where(v => v.IsVaccinated == request.status);
                }

                if (!string.IsNullOrEmpty(request.query))
                {
                    list = list.Where(vr =>
                        vr.Customer!.Full_Name.Contains(request.query) ||
                        vr.Vaccine!.Vaccine_Name.Contains(request.query)

                        );
                }

                var totalEntities = list.Count();

                list = list.OrderBy(vr => vr.Id)
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize);

                var entities = await list.ToListAsync(cancellationToken);

                var paginatedList = new PaginatedList<Injection_Result>(entities, totalEntities, request.Page, request.PageSize);

                return new Injection_Results_Paged
                {
                    CurrentPage = paginatedList.PageIndex,
                    TotalItems = paginatedList.TotalItems,
                    TotalPages = paginatedList.TotalPages,
                    HasPreviousPage = paginatedList.HasPreviousPage,
                    HasNextPage = paginatedList.HasNextPage,
                    Injection_Results = paginatedList
                };
            }
        }

    }
}
