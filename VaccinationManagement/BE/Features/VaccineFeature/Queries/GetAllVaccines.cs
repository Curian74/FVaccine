using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetAllVaccines : IRequest<IEnumerable<Vaccine>>
    {
        public class GetAllVaccinesHandler : IRequestHandler<GetAllVaccines, IEnumerable<Vaccine>>
        {
            private readonly ApplicationDbContext _context;
            public GetAllVaccinesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Vaccine>> Handle(GetAllVaccines request, CancellationToken cancellationToken)
            {
                var list = await _context.Vaccines.Where(v => v.Status == true && v.Time_End_Next_Injection >= DateOnly.FromDateTime(DateTime.Now))
                                                  .ToListAsync(cancellationToken);
                return list;
            }
        }
    }
}
