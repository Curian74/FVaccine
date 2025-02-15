using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
    public class GetLastVaccinationResult : IRequest<ActionResult<Injection_Result>>
    {
        public class GetLastVaccinationResultHandler : IRequestHandler<GetLastVaccinationResult, ActionResult<Injection_Result>>
        {
            private readonly ApplicationDbContext _context;
            public GetLastVaccinationResultHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Result>> Handle(GetLastVaccinationResult request, CancellationToken cancellationToken)
            {
                var schedule = await GetVaccinationResults.IncludeVaccineWithoutCausingALoop(_context.Injection_Results)
                                    .OrderByDescending(sche => sche.Id)
                                    .FirstOrDefaultAsync();

                if (schedule == null)
                {
                    return new NotFoundResult();
                }
                return new OkObjectResult(schedule);
            }
        }

    }
}
