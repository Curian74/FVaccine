using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.ScheduleFeature.Commands
{
    public class CreateScheduleQuery : IRequest<ActionResult<Injection_Schedule>>
    {
        public required string Id { get; set; }
        public string? Description { get; set; }
        public required DateOnly End_Date { get; set; }
        public required string Place_Id { get; set; }
        public required DateOnly Start_Date { get; set; }
        public required string Vaccine_Id { get; set; }
    }

    public class CreateSchedule : IRequest<ActionResult<Injection_Schedule>>
    {
        public class GetCreateScheduleHandler : IRequestHandler<CreateScheduleQuery, ActionResult<Injection_Schedule>>
        {
            private readonly ApplicationDbContext _context;
            public GetCreateScheduleHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Schedule>> Handle(CreateScheduleQuery request, CancellationToken cancellationToken)
            {
                var schedule = new Injection_Schedule
                {
                    Id = request.Id,
                    Description = request.Description,
                    End_Date = request.End_Date,
                    Place_Id = request.Place_Id,
                    Start_Date = request.Start_Date,
                    Vaccine_Id = request.Vaccine_Id,
                };
                _context.Injection_Schedules.Add(schedule);
                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException)
                {
                    if (ScheduleExist(request.Id))
                    {
                        return new ConflictResult();
                    }
                    else
                    {
                        throw;
                    }
                }
                return new CreatedAtActionResult("GetSchedule", "Schedules", new { id = request.Id }, schedule);
            }

            private bool ScheduleExist(string id)
            {
                return _context.Injection_Schedules.Any(t => t.Id == id);
            }
        }

    }
}
