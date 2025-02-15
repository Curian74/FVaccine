using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class GetMenus : IRequest<IEnumerable<Menu>>
    {
        public bool? Status { get; set; }
        public class GetMenusHandler : IRequestHandler<GetMenus, IEnumerable<Menu>>
        {
            private readonly ApplicationDbContext _context;
            public GetMenusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Menu>> Handle(GetMenus request, CancellationToken cancellationToken)
            {
                var query = _context.Menus.AsQueryable();

                if (request.Status != null)
                {
                    query = query.Where(menu => menu.Status == request.Status);
                }

                query = IncludeAuthorizedRoles(query);

                var list = await query.Where(menu => menu.ParentID == null).ToListAsync();
                return list;
            }
        }

        public static IQueryable<Menu> IncludeAuthorization(IQueryable<Menu> query)
        {
            return query.Include(menu => menu.MenuRoleAuthorizations)
              .Select(menu => new Menu
              {
                  Id = menu.Id,
                  Name = menu.Name,
                  Path = menu.Path,
                  Icon = menu.Icon,
                  ParentID = menu.ParentID,
                  Status = menu.Status,
                  MenuRoleAuthorizations = menu.MenuRoleAuthorizations!.Select(mra => new MenuRoleAuthorization
                  {
                      MenuId = menu.Id,
                      RoleId = mra.RoleId,
                  }).ToArray()
              });
        }

        public static IQueryable<Menu> IncludeAuthorizedRoles(IQueryable<Menu> query)
        {
            return query.Include(menu => menu.MenuRoleAuthorizations)
              .Select(menu => new Menu
              {
                  Id = menu.Id,
                  Name = menu.Name,
                  Path = menu.Path,
                  Icon = menu.Icon,
                  ParentID = menu.ParentID,
                  Status = menu.Status,
                  AuthorizedRoles = menu.MenuRoleAuthorizations!.Select(mra => mra.RoleId).ToArray(),
              });
        }

    }
}
