using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PlaceFeature.Queries
{
    public class GetPlaceById : IRequest<ActionResult<Place>>
    {
        public required string Id { get; set; }
        public class GetLastPlaceHandler : IRequestHandler<GetPlaceById, ActionResult<Place>>
        {
            private readonly ApplicationDbContext _context;
            public GetLastPlaceHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Place>> Handle(GetPlaceById request, CancellationToken cancellationToken)
            {
                var place = await _context.Places
                .FirstOrDefaultAsync(e => e.Id == request.Id);

                if (place == null)
                {
                    return new NotFoundResult();
                }
                return new OkObjectResult(place);
            }
        }

    }
}
