using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccineDistributionsQuery : IRequest<Distributions_Paged>
    {
        public required QueryDistributionDTO query { get; set; }
    }

    public class GetVaccineDistributionsGroupedQuery : IRequest<Distributions_VacIdAndPlaceId_Paged>
    {
        public required QueryDistributionDTO query { get; set; }
    }

    public class GetVaccineDistributionsFilter : IRequest<Distributions_Paged>
    {
        public static IQueryable<Distribution> FilterDistributions(DbSet<Distribution> dbset, QueryDistributionDTO requestQuery)
        {
            var query = dbset.AsQueryable();

            if (!String.IsNullOrEmpty(requestQuery.VaccineId))
            {
                query = query.Where(d => d.Vaccine_Id == requestQuery.VaccineId);
            }

            if (!String.IsNullOrEmpty(requestQuery.PlaceId))
            {
                query = query.Where(d => d.Place_Id == requestQuery.PlaceId);
            }

            if (!String.IsNullOrEmpty(requestQuery.PlaceName))
            {
                query = query.Where(d => d.Place!.Name.Contains(requestQuery.PlaceName));
            }

            if (requestQuery.DateRangeStart != null)
            {
                query = query.Where(d => d.Date_Import >= requestQuery.DateRangeStart);
            }

            if (requestQuery.DateRangeEnd != null)
            {
                query = query.Where(d => d.Date_Import <= requestQuery.DateRangeEnd);
            }

            if (requestQuery.MinImportedQuantity != null)
            {
                query = query.Where(d => d.Quantity_Imported >= requestQuery.MinImportedQuantity);
            }

            if (requestQuery.MinInjectedQuantity != null)
            {
                query = query.Where(d => d.Quantity_Injected >= requestQuery.MinInjectedQuantity);
            }

            return query;
        }

        public class GetVaccineDistributionsFilterHandler : IRequestHandler<GetVaccineDistributionsQuery, Distributions_Paged>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccineDistributionsFilterHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Distributions_Paged> Handle(GetVaccineDistributionsQuery request, CancellationToken cancellationToken)
            {
                var list = FilterDistributions(_context.Distributions, request.query);

                if (request.query.MinQuantity != null)
                {
                    list = list.Where(d => d.Quantity_Imported - d.Quantity_Injected >= request.query.MinQuantity);
                }

                var totalEntities = list.Count();

                switch (request.query.OrderBy)
                {
                    case "PlaceName":
                        list = list.OrderBy(sche => sche.Place!.Name);
                        break;

                    case "DateImport":
                        list = list.OrderBy(sche => sche.Date_Import);
                        break;

                    case "DateImportDesc":
                        list = list.OrderByDescending(sche => sche.Date_Import);
                        break;

                    default:
                        list = list.OrderBy(sche => sche.Id);
                        break;
                }

                list = list
                    .Skip((request.query.pageIndex - 1) * request.query.PageSize)
                    .Take(request.query.PageSize);

                list = list.Include(d => d.Vaccine).Include(d => d.Place);

                var entities = await list.ToListAsync(cancellationToken);

                var paginatedList = new PaginatedList<Distribution>(entities, totalEntities, request.query.pageIndex, request.query.PageSize);

                return new Distributions_Paged
                {
                    CurrentPage = paginatedList.PageIndex,
                    TotalItems = paginatedList.TotalItems,
                    TotalPages = paginatedList.TotalPages,
                    HasPreviousPage = paginatedList.HasPreviousPage,
                    HasNextPage = paginatedList.HasNextPage,
                    Distributions = paginatedList
                };
            }
        }
    }

    public class GetVaccineDistributionsFilterGroupedByVacIdAndPlaceId : IRequest<Distributions_VacIdAndPlaceId_Paged>
    {
        public class GetVaccineDistributionsFilterGroupedByVacIdAndPlaceIdHandler : IRequestHandler<GetVaccineDistributionsGroupedQuery, Distributions_VacIdAndPlaceId_Paged>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccineDistributionsFilterGroupedByVacIdAndPlaceIdHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Distributions_VacIdAndPlaceId_Paged> Handle(GetVaccineDistributionsGroupedQuery request, CancellationToken cancellationToken)
            {
                var list = GetVaccineDistributionsFilter.FilterDistributions(_context.Distributions, request.query);

                list = list.Include(d => d.Vaccine).Include(d => d.Place);

                var groupedList = list
                    .GroupBy(d => new { d.Vaccine_Id, d.Place_Id })
                    .Select(g => new Distribution_VacIdAndPlaceId
                    {
                        Id = g.Key.Vaccine_Id + g.Key.Place_Id,
                        Vaccine_Id = g.Key.Vaccine_Id,
                        Place_Id = g.Key.Place_Id,
                        Quantity_Imported = g.Sum(d => d.Quantity_Imported),
                        Quantity_Injected = g.Sum(d => d.Quantity_Injected),
                        Vaccine = g.FirstOrDefault()!.Vaccine,
                        Place = g.FirstOrDefault()!.Place,
                    });

                if (request.query.MinQuantity != null)
                {
                    groupedList = groupedList.Where(d => d.Quantity_Imported - d.Quantity_Injected >= request.query.MinQuantity);
                }

                var totalEntities = groupedList.Count();

                switch (request.query.OrderBy)
                {
                    case "PlaceName":
                        groupedList = groupedList.OrderBy(sche => sche.Place!.Name);
                        break;

                    default:
                        groupedList = groupedList.OrderBy(sche => sche.Id);
                        break;
                }

                groupedList = groupedList
                    .Skip((request.query.pageIndex - 1) * request.query.PageSize)
                    .Take(request.query.PageSize);

                var entities = await groupedList.AsQueryable().ToListAsync(cancellationToken);

                var paginatedList = new PaginatedList<Distribution_VacIdAndPlaceId>(entities, totalEntities, request.query.pageIndex, request.query.PageSize);

                return new Distributions_VacIdAndPlaceId_Paged
                {
                    CurrentPage = paginatedList.PageIndex,
                    TotalItems = paginatedList.TotalItems,
                    TotalPages = paginatedList.TotalPages,
                    HasPreviousPage = paginatedList.HasPreviousPage,
                    HasNextPage = paginatedList.HasNextPage,
                    Distributions = paginatedList
                };
            }
        }
    }
}
