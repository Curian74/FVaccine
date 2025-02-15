using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccines : IRequest<IEnumerable<Vaccine>>
    {
        public class GetVaccinesHandler : IRequestHandler<GetVaccines, IEnumerable<Vaccine>>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccinesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Vaccine>> Handle(GetVaccines request, CancellationToken cancellationToken)
            {
                var listVaccine = await _context.Vaccines
                    .Include(v => v.Vaccine_Type)  
                    .ToListAsync();
                return listVaccine;
            }
        }
    }
}
