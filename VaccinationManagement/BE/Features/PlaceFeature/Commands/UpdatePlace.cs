using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PlaceFeature.Commands
{
    public class UpdatePlaceQuery : IRequest<ActionResult<Place>>
    {
        public required string Id { get; set; }
        public string? Name { get; set; }
        public bool? Status { get; set; }
    }

    public class UpdatePlace : IRequest<ActionResult<Place>>
    {
        public class GetUpdatePlaceHandler : IRequestHandler<UpdatePlaceQuery, ActionResult<Place>>
        {
            private readonly ApplicationDbContext _context;
            public GetUpdatePlaceHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Place>> Handle(UpdatePlaceQuery request, CancellationToken cancellationToken)
            {
                var schedule = await _context.Places.FindAsync(request.Id);
                if (schedule == null)
                {
                    return new NotFoundResult();
                }

                // schedule.Id = request.Id;
                if (!String.IsNullOrEmpty(request.Name)) schedule.Name = request.Name;
                schedule.Status = request.Status ?? schedule.Status;

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException)
                {
                    throw;  // You can remove the conflict check entirely
                }

                return new CreatedAtActionResult("GetPlace", "Places", new { id = request.Id }, schedule);
            }
        }

    }
}
