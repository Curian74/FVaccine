using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.MenuFeature.Commands
{
    public class CreateMenuQuery : IRequest<ActionResult<Menu>>
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public string? Path { get; set; }
        public string? Icon { get; set; }
        public string? ParentID { get; set; }
        public bool Status { get; set; } = false;
    }

    public class CreateMenu : IRequest<ActionResult<Menu>>
    {
        public class GetCreateMenuHandler : IRequestHandler<CreateMenuQuery, ActionResult<Menu>>
        {
            private readonly ApplicationDbContext _context;
            public GetCreateMenuHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Menu>> Handle(CreateMenuQuery request, CancellationToken cancellationToken)
            {
                var menu = new Menu
                {
                    Id = request.Id,
                    Name = request.Name,
                    Path = request.Path,
                    Icon = request.Icon,
                    ParentID = request.ParentID,
                    Status = request.Status,
                };

                _context.Menus.Add(menu);
                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException)
                {
                    if (MenuExist(request.Id))
                    {
                        return new ConflictResult();
                    }
                    else
                    {
                        throw;
                    }
                }
                return new CreatedAtActionResult("GetMenu", "Menus", new { id = request.Id }, menu);
            }

            private bool MenuExist(string id)
            {
                return _context.Menus.Any(t => t.Id == id);
            }
        }

    }
}
