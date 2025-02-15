using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Features.MenuFeature.Queries;

namespace VaccinationManagement.Features.MenuFeature.Commands
{
    public class UpdateMenuQuery : IRequest<ActionResult<Menu>>
    {
        public string? Name { get; set; }
        public string? Path { get; set; }
        public string? Icon { get; set; }
        public string? ParentID { get; set; }
        public bool? Status { get; set; }
        public required string Id { get; set; }
        public ICollection<int>? AuthorizedRoles { get; set; } = null;
    }

    public class UpdateMenu : IRequest<ActionResult<Menu>>
    {
        public class GetUpdateMenuHandler : IRequestHandler<UpdateMenuQuery, ActionResult<Menu>>
        {
            private readonly ApplicationDbContext _context;
            public GetUpdateMenuHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Menu>> Handle(UpdateMenuQuery request, CancellationToken cancellationToken)
            {
                var query = _context.Menus.AsQueryable();
                query = GetMenus.IncludeAuthorization(query);
                var menu = await query.FirstOrDefaultAsync(m => m.Id == request.Id);

                if (menu == null)
                {
                    return new NotFoundResult();
                }

                // menu.Id = request.Id;
                if (request.Name != null) menu.Name = request.Name;
                if (request.Path != null) menu.Path = request.Path;
                if (request.Icon != null) menu.Icon = request.Icon;
                menu.ParentID = request.ParentID;
                menu.Status = request.Status ?? menu.Status;

                if (request.AuthorizedRoles != null)
                {
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
                }

                try
                {
                    menu.MenuRoleAuthorizations = null; // 6hrs of debugging to add this line btw
                    _context.Attach(menu);
                    _context.Entry(menu).State = EntityState.Modified;
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException e)
                {
                    throw e;  // You can remove the conflict check entirely
                }

                return new CreatedAtActionResult("GetMenus", "Menus", new { id = request.Id }, menu);
            }
        }

    }
}
