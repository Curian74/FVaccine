using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class GetMenuRoleAuthorization : IRequest<IEnumerable<MenuRoleAuthorization>>
    {
        public class GetMenuRoleAuthorizationHandler : IRequestHandler<GetMenuRoleAuthorization, IEnumerable<MenuRoleAuthorization>>
        {
            private readonly ApplicationDbContext _context;
            public GetMenuRoleAuthorizationHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<MenuRoleAuthorization>> Handle(GetMenuRoleAuthorization request, CancellationToken cancellationToken)
            {
                var query = _context.MenuRoleAuthorizations.AsQueryable();
                query = query.Include(auth => auth.Menu).Include(auth => auth.UserRole);
                var list = await query.ToListAsync();
                return list;
            }
        }
    }
}
