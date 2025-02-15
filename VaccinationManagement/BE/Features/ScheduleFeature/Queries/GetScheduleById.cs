using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.ScheduleFeature.Queries
{
    public class GetScheduleById : IRequest<ActionResult<Injection_Schedule>>
    {
        public required string Id { get; set; }
        public class GetLastScheduleHandler : IRequestHandler<GetScheduleById, ActionResult<Injection_Schedule>>
        {
            private readonly ApplicationDbContext _context;
            public GetLastScheduleHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Schedule>> Handle(GetScheduleById request, CancellationToken cancellationToken)
            {

                var schedule = await GetSchedules.IncludeVaccineWithoutCausingALoop(_context.Injection_Schedules)
                                    .FirstOrDefaultAsync(e => e.Id == request.Id);

                if (schedule == null)
                {
                    return new NotFoundResult();
                }
                return new OkObjectResult(schedule);
            }
        }

    }
}
