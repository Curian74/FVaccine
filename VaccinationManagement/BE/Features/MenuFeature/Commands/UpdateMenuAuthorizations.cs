using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Features.MenuFeature.Queries;

namespace VaccinationManagement.Features.MenuFeature.Commands
{
    public class UpdateMenuAuthorizationsQuery : IRequest<ActionResult<Menu>>
    {
        public required string Id { get; set; }
        public required ICollection<int> AuthorizedRoles { get; set; }
        public Menu? menu { get; set; }
    }


    public class UpdateMenuAuthorizations : IRequest<ActionResult<Menu>>
    {
        public class GetMenusHandler : IRequestHandler<UpdateMenuAuthorizationsQuery, ActionResult<Menu>>
        {
            private readonly ApplicationDbContext _context;
            public GetMenusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Menu>> Handle(UpdateMenuAuthorizationsQuery request, CancellationToken cancellationToken)
            {
                Menu? menu = request.menu;
                if (menu == null)
                {
                    var query = _context.Menus.AsQueryable();
                    query = GetMenus.IncludeAuthorization(query);
                    menu = await query.FirstOrDefaultAsync(menu => menu.Id == request.Id);
                    if (menu == null)
                    {
                        return new NotFoundResult();
                    }
                }

                if (menu.MenuRoleAuthorizations == null)
                {
                    return new UnprocessableEntityResult();
                }

                var requestAuthsList = request.AuthorizedRoles.Select(RoleId => new MenuRoleAuthorization { MenuId = request.Id, RoleId = RoleId }).ToList();
                var databaseAuthsList = menu.MenuRoleAuthorizations.ToList();
                // Add all auths in the request that does not exist in the database yet
                foreach (MenuRoleAuthorization requestAuth in requestAuthsList)
                {
                    var existingAuth = databaseAuthsList.Find(databaseAuth => databaseAuth.RoleId == requestAuth.RoleId);

                    if (existingAuth == null)
                    {
                        _context.MenuRoleAuthorizations.Add(requestAuth);
                    }
                }

                // Remove all auths that exist in the database but was not included in the request
                foreach (MenuRoleAuthorization databaseAuth in databaseAuthsList)
                {

                    var existingAuth = requestAuthsList.Find(requestAuth => requestAuth.RoleId == databaseAuth.RoleId);

                    if (existingAuth == null)
                    {
                        _context.MenuRoleAuthorizations.Attach(databaseAuth);
                        _context.MenuRoleAuthorizations.Remove(databaseAuth);
                    }
                }

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateConcurrencyException)
                {
                    return new ConflictResult();
                }

                return menu;
            }
        }
    }
}
