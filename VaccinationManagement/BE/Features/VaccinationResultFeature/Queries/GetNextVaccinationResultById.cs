using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
    public class GetNextVaccinationResultById : IRequest<ActionResult<Injection_Result>>
    {
        public required string Id { get; set; }
        public class GetLastVaccinationResultHandler : IRequestHandler<GetNextVaccinationResultById, ActionResult<Injection_Result>>
        {
            private readonly ApplicationDbContext _context;
            public GetLastVaccinationResultHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ActionResult<Injection_Result>> Handle(GetNextVaccinationResultById request, CancellationToken cancellationToken)
            {
                var schedule = await GetVaccinationResults.IncludeVaccineWithoutCausingALoop(_context.Injection_Results)
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
