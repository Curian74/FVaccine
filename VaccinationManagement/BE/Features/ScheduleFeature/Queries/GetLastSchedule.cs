using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.ScheduleFeature.Queries
{
    public class GetLastSchedule : IRequest<ActionResult<Injection_Schedule>>
    {
        public class GetLastScheduleHandler : IRequestHandler<GetLastSchedule, ActionResult<Injection_Schedule>>
        {
            private readonly ApplicationDbContext _context;
            public GetLastScheduleHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Schedule>> Handle(GetLastSchedule request, CancellationToken cancellationToken)
            {
                var schedule = await _context.Injection_Schedules
                            .OrderByDescending(sche => sche.Id)
                            .FirstOrDefaultAsync(cancellationToken);
                if (schedule == null)
                {
                    return new NotFoundResult();
                }
                return schedule;
            }
        }

    }
}
