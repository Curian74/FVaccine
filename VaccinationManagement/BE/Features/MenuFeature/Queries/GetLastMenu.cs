using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.MenuFeature.Queries
{
    public class GetLastMenu : IRequest<ActionResult<Menu>>
    {
        public class GetLastMenuHandler : IRequestHandler<GetLastMenu, ActionResult<Menu>>
        {
            private readonly ApplicationDbContext _context;
            public GetLastMenuHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Menu>> Handle(GetLastMenu request, CancellationToken cancellationToken)
            {
                var menu = await _context.Menus
                            .OrderByDescending(m => m.Id)
                            .FirstOrDefaultAsync(cancellationToken);
                if (menu == null)
                {
                    return new NotFoundResult();
                }
                return menu;
            }
        }

    }
}
