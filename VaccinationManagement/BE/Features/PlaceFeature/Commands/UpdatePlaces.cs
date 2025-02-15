using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PlaceFeature.Commands
{
    public class UpdatePlacesQuery : IRequest<IEnumerable<String>>
    {
        public required IEnumerable<UpdatePlaceQuery> queries { get; set; }
    }

    public class UpdatePlaces : IRequest<IEnumerable<String>>
    {

        public class GetUpdatePlacesHandler : IRequestHandler<UpdatePlacesQuery, IEnumerable<String>>
        {
            private readonly ApplicationDbContext _context;
            public GetUpdatePlacesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<String>> Handle(UpdatePlacesQuery request, CancellationToken cancellationToken)
            {
                IEnumerable<String> unsuccessfulUpdates = new List<String>();

                foreach (UpdatePlaceQuery query in request.queries)
                {
                    var schedule = await _context.Places.FindAsync(query.Id);
                    if (schedule == null)
                    {
                        // return new NotFoundResult();
                        unsuccessfulUpdates.Append(query.Id);
                        continue;
                    }

                    // schedule.Id = query.Id;
                    if (!String.IsNullOrEmpty(query.Name)) schedule.Name = query.Name;
                    schedule.Status = query.Status ?? schedule.Status;

                    try
                    {
                        await _context.SaveChangesAsync(cancellationToken);
                    }
                    catch (DbUpdateException)
                    {
                        unsuccessfulUpdates.Append(query.Id);
                        continue;
                    }
                }

                return unsuccessfulUpdates;
            }
        }

    }
}
