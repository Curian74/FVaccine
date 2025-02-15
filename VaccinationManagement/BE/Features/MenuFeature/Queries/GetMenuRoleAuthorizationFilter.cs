using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class GetMenuRoleAuthorizationFilterQuery : IRequest<MenuRoleAuthorization_Paged>
    {
        public required QueryMenuRoleAuthorizationDTO query { get; set; }
    }

    public class GetMenuRoleAuthorizationFilter : IRequest<IEnumerable<MenuRoleAuthorization>>
    {
        public class GetMenuRoleAuthorizationHandler : IRequestHandler<GetMenuRoleAuthorizationFilterQuery, MenuRoleAuthorization_Paged>
        {
            private readonly ApplicationDbContext _context;
            public GetMenuRoleAuthorizationHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<MenuRoleAuthorization_Paged> Handle(GetMenuRoleAuthorizationFilterQuery request, CancellationToken cancellationToken)
            {
                var query = _context.MenuRoleAuthorizations.AsQueryable();

                if (!string.IsNullOrEmpty(request.query.MenuId))
                {
                    query = query.Where(vr => vr.MenuId == request.query.MenuId);
                }
                else if (request.query.RoleId != null)
                {
                    query = query.Where(vr => vr.RoleId == request.query.RoleId);
                }
                

                var totalEntities = await query.CountAsync(cancellationToken);

                query = query.OrderBy(vr => vr.MenuId)
                    .Skip((request.query.pageIndex - 1) * request.query.PageSize)
                    .Take(request.query.PageSize);

                query = query.Include(auth => auth.Menu).Include(auth => auth.UserRole);

                var entities = await query.ToListAsync(cancellationToken);

                var paginatedList = new PaginatedList<MenuRoleAuthorization>(entities, totalEntities, request.query.pageIndex, request.query.PageSize);

                return new MenuRoleAuthorization_Paged
                {
                    CurrentPage = paginatedList.PageIndex,
                    TotalItems = paginatedList.TotalItems,
                    TotalPages = paginatedList.TotalPages,
                    HasPreviousPage = paginatedList.HasPreviousPage,
                    HasNextPage = paginatedList.HasNextPage,
                    MenuRoleAuthorizations = paginatedList
                };
            }
        }
    }
}
