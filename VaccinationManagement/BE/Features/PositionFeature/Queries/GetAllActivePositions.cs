using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PositionFeature.Queries
{
    public class GetAllActivePositions : IRequest<IEnumerable<EmployeePosition>>
    {
        public class GetAllActivePositionsHandler : IRequestHandler<GetAllActivePositions, IEnumerable<EmployeePosition>>
        {
            private readonly ApplicationDbContext _context;

            public GetAllActivePositionsHandler(ApplicationDbContext context)
            {
                _context = context;
            }


            public async Task<IEnumerable<EmployeePosition>> Handle(GetAllActivePositions request, CancellationToken cancellationToken)
            {
                var positions = await _context.EmployeePositions.Where(x => x.Status).ToListAsync();

                return positions;
            }
        }
    }
}
