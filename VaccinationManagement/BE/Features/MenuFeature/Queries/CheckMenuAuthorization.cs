using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class CheckMenuAuthorization : IRequest<bool>
    {
        public required string MenuId { get; set; }
        public required int RoleId { get; set; }
        public class GetMenuRoleAuthorizationHandler : IRequestHandler<CheckMenuAuthorization, bool>
        {
            private readonly ApplicationDbContext _context;
            public GetMenuRoleAuthorizationHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<bool> Handle(CheckMenuAuthorization request, CancellationToken cancellationToken)
            {
                var auth = await _context.MenuRoleAuthorizations.FirstOrDefaultAsync(auth => auth.MenuId == request.MenuId && auth.RoleId == request.RoleId);
                if (auth == null) {
                  return false;
                }
                return true;
            }
        }
    }
}
