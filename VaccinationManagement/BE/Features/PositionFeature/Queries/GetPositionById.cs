using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PositionFeature.Queries
{
    public class GetPositionById : IRequest<EmployeePosition>
    {
        public string? Id { get; set; }
        public class GetPositionByIdHandler : IRequestHandler<GetPositionById, EmployeePosition>
        {
            private readonly ApplicationDbContext _context;

            public GetPositionByIdHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<EmployeePosition> Handle(GetPositionById request, CancellationToken cancellationToken)
            {
                var position = await _context.EmployeePositions.FirstOrDefaultAsync(p => p.Id == request.Id);

                if (position == null)
                {
                    return null;
                }

                return position;

            }
        }
    }
}
