using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccineById : IRequest<Vaccine>
    {
        public required string Id { get; set; }
 
        public class GetVaccineByIdHandler : IRequestHandler<GetVaccineById, Vaccine>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccineByIdHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<Vaccine> Handle(GetVaccineById request, CancellationToken cancellationToken)
            {
                var vaccine = await _context.Vaccines
                    .Include(v => v.Vaccine_Type)
                    .FirstOrDefaultAsync(v => v.Id == request.Id);

                return vaccine!;
            }
        }
    }
}
