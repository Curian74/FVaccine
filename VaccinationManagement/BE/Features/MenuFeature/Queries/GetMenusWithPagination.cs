using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class GetMenuWithPaginationQuery : IRequest<Menus_Paged>
    {
        public required QueryMenuDTO query { get; set; }
        public string? SearchQuery { get; set; }
    }

    public class GetMenusWithPagination : IRequest<Menus_Paged>
    {
        public class GetMenusHandler : IRequestHandler<GetMenuWithPaginationQuery, Menus_Paged>
        {
            private readonly ApplicationDbContext _context;
            public GetMenusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Menus_Paged> Handle(GetMenuWithPaginationQuery request, CancellationToken cancellationToken)
            {
                var list = _context.Menus.Where(subMenu => subMenu.ParentID == request.query.ParentId).AsQueryable();

                if (request.query.Status != null) {
                  list = list.Where(menu => menu.Status == request.query.Status);
                }

                if (!string.IsNullOrEmpty(request.SearchQuery))
                {
                    list = list.Where(menu =>
                        menu.Name.Contains(request.SearchQuery) ||
                        menu.Icon!.Contains(request.SearchQuery)
                        );
                }
                else
                {
                    if (!string.IsNullOrEmpty(request.query.Name))
                    {
                        list = list.Where(menu => menu.Name.Contains(request.query.Name));
                    }
                }

                var totalEntities = list.Count();

                list = list.OrderBy(menu => menu.Id)
                    .Skip((request.query.pageIndex - 1) * request.query.PageSize)
                    .Take(request.query.PageSize);

                list = GetMenus.IncludeAuthorizedRoles(list);

                var entities = await list.ToListAsync(cancellationToken);

                var paginatedList = new PaginatedList<Menu>(entities, totalEntities, request.query.pageIndex, request.query.PageSize);

                return new Menus_Paged
                {
                    CurrentPage = paginatedList.PageIndex,
                    TotalItems = paginatedList.TotalItems,
                    TotalPages = paginatedList.TotalPages,
                    HasPreviousPage = paginatedList.HasPreviousPage,
                    HasNextPage = paginatedList.HasNextPage,
                    Menus = paginatedList
                };
            }
        }
    }
}
