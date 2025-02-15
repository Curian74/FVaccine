using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PositionFeature.Commands
{
    public class ChangePositionStatus : IRequest<List<EmployeePosition>>
    {
        public List<PositionStatusRequest>? Positions { get; set; }

        public class PositionStatusRequest
        {
            public string? Id { get; set; }
        }

        public class ChangePositionStatusHandler : IRequestHandler<ChangePositionStatus, List<EmployeePosition>>
        {
            private readonly ApplicationDbContext _context;

            public ChangePositionStatusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<List<EmployeePosition>> Handle(ChangePositionStatus request, CancellationToken cancellationToken)
            {
                var updatedPositions = new List<EmployeePosition>();

                foreach (var updateRequest in request.Positions!)
                {
                    var position = await _context.EmployeePositions.FirstOrDefaultAsync(
                        x => x.Id == updateRequest.Id, cancellationToken);

                    if (position == null)
                    {
                        throw new ArgumentException($"Position with ID {updateRequest.Id} not found");
                    }

                    position.Status = !position.Status;

                    updatedPositions.Add(position);
                }

                _context.EmployeePositions.UpdateRange(updatedPositions);
                await _context.SaveChangesAsync(cancellationToken);

                return updatedPositions;
            }
        }
    }
}
