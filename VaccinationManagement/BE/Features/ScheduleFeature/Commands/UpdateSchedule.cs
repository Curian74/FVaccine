using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.ScheduleFeature.Commands
{
    public class UpdateScheduleQuery : IRequest<ActionResult<Injection_Schedule>>
    {
        public string? Id { get; set; }
        public string? Description { get; set; }
        public DateOnly? End_Date { get; set; }
        public string? Place_Id { get; set; }
        public DateOnly? Start_Date { get; set; }
        public string? Vaccine_Id { get; set; }
    }

    public class UpdateSchedule : IRequest<ActionResult<Injection_Schedule>>
    {
        public class GetUpdateScheduleHandler : IRequestHandler<UpdateScheduleQuery, ActionResult<Injection_Schedule>>
        {
            private readonly ApplicationDbContext _context;
            public GetUpdateScheduleHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Schedule>> Handle(UpdateScheduleQuery request, CancellationToken cancellationToken)
            {
                var schedule = await _context.Injection_Schedules.FindAsync(request.Id);
                if (schedule == null)
                {
                    return new NotFoundResult();
                }

                // schedule.Id = request.Id;
                if (!String.IsNullOrEmpty(request.Description)) schedule.Description = request.Description;
                if (request.End_Date.HasValue) schedule.End_Date = request.End_Date.Value;
                if (!String.IsNullOrEmpty(request.Place_Id)) schedule.Place_Id = request.Place_Id;
                if (request.Start_Date.HasValue) schedule.Start_Date = request.Start_Date.Value;
                if (!String.IsNullOrEmpty(request.Vaccine_Id)) schedule.Vaccine_Id = request.Vaccine_Id;

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException)
                {
                    throw;  // You can remove the conflict check entirely
                }

                return new CreatedAtActionResult("GetSchedule", "Schedules", new { id = request.Id }, schedule);
            }
        }

    }
}
