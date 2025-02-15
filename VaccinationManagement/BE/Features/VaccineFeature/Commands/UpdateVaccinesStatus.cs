using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Commands
{
    public class UpdateVaccinesStatus : IRequest<bool>
    {
        public List<string> VaccineIds { get; set; }  

        public class UpdateVaccineStatusHandler : IRequestHandler<UpdateVaccinesStatus, bool>
        {
            private readonly ApplicationDbContext _context;

            public UpdateVaccineStatusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<bool> Handle(UpdateVaccinesStatus request, CancellationToken cancellationToken)
            {
                // Retrieve all vaccines with the specified IDs
                var vaccinesToUpdate = await _context.Vaccines
                    .Where(v => request.VaccineIds.Contains(v.Id))
                    .ToListAsync();

                if (vaccinesToUpdate == null || vaccinesToUpdate.Count == 0)
                    return false;

                foreach (var vaccine in vaccinesToUpdate)
                {
                    vaccine.Status = !vaccine.Status;
                    _context.Vaccines.Update(vaccine);
                }

                await _context.SaveChangesAsync(cancellationToken);

                return true;
            }
        }
    }
}
