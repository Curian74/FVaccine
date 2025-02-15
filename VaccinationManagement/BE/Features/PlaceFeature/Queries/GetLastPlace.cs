using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PlaceFeature.Queries
{
    public class GetLastPlace : IRequest<ActionResult<Place>>
    {
        public class GetLastPlaceHandler : IRequestHandler<GetLastPlace, ActionResult<Place>>
        {
            private readonly ApplicationDbContext _context;
            public GetLastPlaceHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Place>> Handle(GetLastPlace request, CancellationToken cancellationToken)
            {
                var place = await _context.Places
                            .OrderByDescending(pl => pl.Id)
                            .FirstOrDefaultAsync(cancellationToken);

                if (place == null)
                {
                    return new NotFoundResult();
                }
                return place;
            }
        }

    }
}
