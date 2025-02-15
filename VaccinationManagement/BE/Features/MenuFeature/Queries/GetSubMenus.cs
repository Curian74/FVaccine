using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class GetSubMenus : IRequest<IEnumerable<Menu>>
    {
        public string? Id { get; set; }
        public bool? Status { get; set; }
        public class GetSubMenusHandler : IRequestHandler<GetSubMenus, IEnumerable<Menu>>
        {
            private readonly ApplicationDbContext _context;
            public GetSubMenusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Menu>> Handle(GetSubMenus request, CancellationToken cancellationToken)
            {
                var query = _context.Menus.Where(subMenu => subMenu.ParentID == request.Id);

                if (request.Status != null)
                {
                    query = query.Where(menu => menu.Status == request.Status);
                }

                query = GetMenus.IncludeAuthorizedRoles(query);

                var list = await query.ToListAsync();
                return query;
            }
        }
    }
}
