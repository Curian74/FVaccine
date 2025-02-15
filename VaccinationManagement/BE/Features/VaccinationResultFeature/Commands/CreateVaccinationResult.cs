using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Commands
{
    public class CreateVaccinationResultQuery : IRequest<ActionResult<Injection_Result>>
    {
        public required string Id { get; set; }
        public required string Customer_Id { get; set; }
        public DateOnly? Injection_Date { get; set; }
        public string? Injection_Place_Id { get; set; }
        public DateOnly? Next_Injection_Date { get; set; }
        public int Number_Of_Injection { get; set; } = 0;
        public int Injection_Number { get; set; } = 0;
        public required string Prevention { get; set; }
        public required string Vaccine_Id { get; set; }
        public ResultStatus IsVaccinated { get; set; } = ResultStatus.NotInjected;
    }

    public class CreateVaccinationResult : IRequest<ActionResult<Injection_Result>>
    {
        public class GetCreateVaccinationResultHandler : IRequestHandler<CreateVaccinationResultQuery, ActionResult<Injection_Result>>
        {
            private readonly ApplicationDbContext _context;
            public GetCreateVaccinationResultHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Result>> Handle(CreateVaccinationResultQuery request, CancellationToken cancellationToken)
            {
                var result = new Injection_Result
                {
                    Id = request.Id,
                    Customer_Id = request.Customer_Id,
                    Injection_Date = request.Injection_Date,
                    Injection_Place_Id = request.Injection_Place_Id,
                    Next_Injection_Date = request.Next_Injection_Date,
                    Number_Of_Injection = request.Number_Of_Injection,
                    Injection_Number = request.Injection_Number,
                    Prevention = request.Prevention,
                    Vaccine_Id = request.Vaccine_Id,
                    IsVaccinated = request.IsVaccinated
                };
                _context.Injection_Results.Add(result);
                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException)
                {
                    if (VaccinationResultExist(request.Id))
                    {
                        return new ConflictResult();
                    }
                    else
                    {
                        throw;
                    }
                }
                return new CreatedAtActionResult("GetVaccinationResult", "VaccinationResults", new { id = request.Id }, result);
            }

            private bool VaccinationResultExist(string id)
            {
                return _context.Injection_Results.Any(t => t.Id == id);
            }
        }

    }
}
