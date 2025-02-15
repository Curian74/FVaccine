using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PlaceFeature.Commands
{
    public class CreatePlaceQuery : IRequest<ActionResult<Place>>
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public bool Status { get; set; } = true;
    }

    public class CreatePlace : IRequest<ActionResult<Place>>
    {
        public class GetCreatePlaceHandler : IRequestHandler<CreatePlaceQuery, ActionResult<Place>>
        {
            private readonly ApplicationDbContext _context;
            public GetCreatePlaceHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Place>> Handle(CreatePlaceQuery request, CancellationToken cancellationToken)
            {
                var place = new Place
                {
                    Id = request.Id,
                    Name = request.Name,
                    Status = request.Status
                };

                _context.Places.Add(place);
                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException)
                {
                    if (PlaceExist(request.Id))
                    {
                        return new ConflictResult();
                    }
                    else
                    {
                        throw;
                    }
                }
                return new CreatedAtActionResult("GetPlace", "Places", new { id = request.Id }, place);
            }

            private bool PlaceExist(string id)
            {
                return _context.Places.Any(t => t.Id == id);
            }
        }

    }
}
