using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
    public class GetVaccinationResultsFilterQuery : IRequest<Injection_Results_Paged>
    {
        public required QueryVaccineResultsDTO query { get; set; }
        public string? SearchQuery { get; set; }
    }

    public class GetVaccinationResultsFilter : IRequest<Injection_Results_Paged>
    {
        public class GetVaccinationResultHandler : IRequestHandler<GetVaccinationResultsFilterQuery, Injection_Results_Paged>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccinationResultHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Injection_Results_Paged> Handle(GetVaccinationResultsFilterQuery request, CancellationToken cancellationToken)
            {
                var list = GetVaccinationResults.IncludeVaccineWithoutCausingALoop(_context.Injection_Results);

                if (request.query.Status.HasValue)
                {
                    list = list.Where(v => v.IsVaccinated == request.query.Status.Value);
                }

                if (!string.IsNullOrEmpty(request.SearchQuery))
                {
                    list = list.Where(res =>
                        res.Injection_Place!.Name.Contains(request.SearchQuery) |
                        res.Vaccine!.Vaccine_Name.Contains(request.SearchQuery)

                        );
                }

                if (!string.IsNullOrEmpty(request.query.VaccineTypeId))
                {
                    list = list.Where(vr => vr.Vaccine!.Vaccine_Type_Id == request.query.VaccineTypeId);
                }
                if (!string.IsNullOrEmpty(request.query.Prevention))
                {
                    list = list.Where(vr =>
                        vr.Vaccine!.Vaccine_Name.Contains(request.query.Prevention) ||
                        vr.Prevention!.Contains(request.query.Prevention)
                        );
                }

                if (!string.IsNullOrEmpty(request.query.FromInjectDate) &&
                    DateOnly.TryParse(request.query.FromInjectDate, out DateOnly fromDate))
                {
                    list = list.Where(v => v.Injection_Date >= fromDate);
                }

                if (!string.IsNullOrEmpty(request.query.ToInjectDate) &&
                    DateOnly.TryParse(request.query.ToInjectDate, out DateOnly toDate))
                {
                    list = list.Where(v => v.Injection_Date <= toDate);
                }

                if (!string.IsNullOrEmpty(request.query.CustomerId))
                {
                    list = list.Where(vr => vr.Customer_Id == request.query.CustomerId);
                }

                if (request.query.Injection_Number != null)
                {
                    list = list.Where(vr => vr.Injection_Number == request.query.Injection_Number);
                }

                if (!string.IsNullOrEmpty(request.query.VaccineId))
                {
                    list = list.Where(vr => vr.Vaccine_Id == request.query.VaccineId);
                }

                var totalEntities = await list.CountAsync(cancellationToken);

                list = list.OrderBy(vr => vr.Id)
                    .Skip((request.query.pageIndex - 1) * request.query.PageSize)
                    .Take(request.query.PageSize);

                var entities = await list.ToListAsync(cancellationToken);


                var paginatedList = new PaginatedList<Injection_Result>(entities, totalEntities, request.query.pageIndex, request.query.PageSize);

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
