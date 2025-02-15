using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GenerateVaccineId : IRequest<string>
    {
        public class GenerateVaccineIdHandler : IRequestHandler<GenerateVaccineId, string>
        {
            private readonly ApplicationDbContext _context;

            public GenerateVaccineIdHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(GenerateVaccineId request, CancellationToken cancellationToken)
            {
                // Get the current highest ID
                var highestId = await _context.Vaccines
                    .OrderByDescending(v => v.Id) 
                    .Select(v => v.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (highestId == null)
                {
                    highestId = "Null";
                }

                return highestId;
            }
        }
    }
}
