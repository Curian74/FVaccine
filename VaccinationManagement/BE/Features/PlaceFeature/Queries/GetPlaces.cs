using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PlaceFeature.Queries
{
    public class GetPlaces : IRequest<IEnumerable<Place>>
    {
        public string? query { get; set; }
        public bool? status { get; set; }
        public class GetPlacesHandler : IRequestHandler<GetPlaces, IEnumerable<Place>>
        {
            private readonly ApplicationDbContext _context;

            public GetPlacesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Place>> Handle(GetPlaces request, CancellationToken cancellationToken)
            {
                var positions = _context.Places.Where(pl => pl.Status == (request.status ?? pl.Status));

                if (!String.IsNullOrEmpty(request.query))
                    positions = positions.Where(pl => pl.Name.Contains(request.query));

                return await positions.ToListAsync();
            }
        }
    }
}
