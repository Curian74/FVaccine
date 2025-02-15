using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class GetMenuById : IRequest<ActionResult<Menu>>
    {
        public required string Id { get; set; }
        public class GetMenusHandler : IRequestHandler<GetMenuById, ActionResult<Menu>>
        {
            private readonly ApplicationDbContext _context;
            public GetMenusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Menu>> Handle(GetMenuById request, CancellationToken cancellationToken)
            {
                var query = _context.Menus.AsQueryable();
                query = GetMenus.IncludeAuthorizedRoles(query);
                var menu = await query.FirstOrDefaultAsync(menu => menu.Id == request.Id);

                if (menu == null)
                {
                    return new NotFoundResult();
                }

                return menu;
            }
        }
    }
}
