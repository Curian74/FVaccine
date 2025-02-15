using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Commands
{
    public class UpdateVaccinationResultQuery : IRequest<ActionResult<Injection_Result>>
    {
        public required string Id { get; set; }
        public required string? Customer_Id { get; set; }
        public DateOnly? Injection_Date { get; set; }
        public string? Injection_Place_Id { get; set; }
        public DateOnly? Next_Injection_Date { get; set; }
        public int? Number_Of_Injection { get; set; } = 0;
        public int? Injection_Number { get; set; } = 0;
        public string? Prevention { get; set; }
        public string? Vaccine_Id { get; set; }
        public ResultStatus? IsVaccinated { get; set; }
    }

    public class UpdateVaccinationResult : IRequest<ActionResult<Injection_Result>>
    {
        public class GetUpdateVaccinationResultHandler : IRequestHandler<UpdateVaccinationResultQuery, ActionResult<Injection_Result>>
        {
            private readonly ApplicationDbContext _context;
            public GetUpdateVaccinationResultHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Result>> Handle(UpdateVaccinationResultQuery request, CancellationToken cancellationToken)
            {
                var result = await _context.Injection_Results.FindAsync(request.Id);
                if (result == null)
                {
                    return new NotFoundResult();
                }

                // result.Id = request.Id;
                if (!String.IsNullOrEmpty(request.Customer_Id)) result.Customer_Id = request.Customer_Id;
                if (request.Injection_Date.HasValue) result.Injection_Date = request.Injection_Date;
                if (!String.IsNullOrEmpty(request.Injection_Place_Id)) result.Injection_Place_Id = request.Injection_Place_Id;
                if (request.Next_Injection_Date.HasValue) result.Next_Injection_Date = request.Next_Injection_Date;
                result.Number_Of_Injection = request.Number_Of_Injection ?? result.Number_Of_Injection;
                result.Injection_Number = request.Injection_Number ?? result.Injection_Number;
                if (!String.IsNullOrEmpty(request.Prevention)) result.Prevention = request.Prevention;
                if (!String.IsNullOrEmpty(request.Vaccine_Id)) result.Vaccine_Id = request.Vaccine_Id;
                if (request.IsVaccinated.HasValue) result.IsVaccinated = request.IsVaccinated.Value;

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException)
                {
                    throw;  // You can remove the conflict check entirely
                }

                return new CreatedAtActionResult("GetVaccinationResult", "VaccinationResults", new { id = request.Id }, result);
            }
        }

    }
}
