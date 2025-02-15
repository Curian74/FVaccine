using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PlaceFeature.Queries
{
    public class GetPlacesWithPaginationQuery : IRequest<Places_Paged>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public string? query { get; set; }
        public bool? status { get; set; }
        public bool exact { get; set; } = false;
    }

    public class GetPlacesWithPagination : IRequest<Places_Paged>
    {
        public class GetPlacesWithPaginationHandler : IRequestHandler<GetPlacesWithPaginationQuery, Places_Paged>
        {
            private readonly ApplicationDbContext _context;
            public GetPlacesWithPaginationHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Places_Paged> Handle(GetPlacesWithPaginationQuery request, CancellationToken cancellationToken)
            {
                var list = _context.Places.Where(pl => pl.Status == (request.status ?? pl.Status));

                if (!String.IsNullOrEmpty(request.query))
                    list = (request.exact) ? list.Where(pl => pl.Name.Equals(request.query))
                                            :
                                            list.Where(pl => pl.Name.Contains(request.query));

                var totalEntities = list.Count();

                list = list.OrderBy(sche => sche.Id)
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize);

                var entities = await list.ToListAsync(cancellationToken);

                var paginatedList = new PaginatedList<Place>(entities, totalEntities, request.Page, request.PageSize);

                return new Places_Paged
                {
                    CurrentPage = paginatedList.PageIndex,
                    TotalItems = paginatedList.TotalItems,
                    TotalPages = paginatedList.TotalPages,
                    HasPreviousPage = paginatedList.HasPreviousPage,
                    HasNextPage = paginatedList.HasNextPage,
                    Places = paginatedList
                };
            }
        }

    }
}
