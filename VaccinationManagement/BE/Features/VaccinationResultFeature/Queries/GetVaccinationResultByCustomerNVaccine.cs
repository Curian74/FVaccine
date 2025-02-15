using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
    public class GetVaccinationResultByCustomerNVaccine : IRequest<ActionResult<Injection_Result>>
    {
        public required string CustomerId { get; set; }
        public required string VaccineId { get; set; }
        public class GetVaccinationResultByCustomerNVaccineHandler : IRequestHandler<GetVaccinationResultByCustomerNVaccine, ActionResult<Injection_Result>>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccinationResultByCustomerNVaccineHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Result>> Handle(GetVaccinationResultByCustomerNVaccine request, CancellationToken cancellationToken)
            {
                var result = await GetVaccinationResults.IncludeVaccineWithoutCausingALoop(_context.Injection_Results)
                .OrderByDescending(r => r.Injection_Number).ThenBy(r => r.IsVaccinated)
                .FirstOrDefaultAsync(c =>
                c.Customer_Id.Trim().ToLower() == request.CustomerId.Trim().ToLower() &&
                c.Vaccine_Id.Trim().ToLower() == request.VaccineId.Trim().ToLower());

                if (result == null)
                {
                    return new NotFoundResult();
                }
                return new OkObjectResult(result);
            }
        }

    }
}
