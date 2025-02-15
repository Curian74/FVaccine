using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Data;

namespace VaccinationManagement.Features.PositionFeature.Commands
{
    public class UpdatePosition : IRequest<List<EmployeePosition>>
    {
        public List<PositionUpdateRequest>? Positions { get; set; }

        // Define a nested class to hold individual update details
        public class PositionUpdateRequest
        {
            public string? Id { get; set; }
            public string? PositionName { get; set; }
        }

        public class UpdatePositionHandler : IRequestHandler<UpdatePosition, List<EmployeePosition>>
        {
            private readonly ApplicationDbContext _context;

            public UpdatePositionHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<List<EmployeePosition>> Handle(UpdatePosition request, CancellationToken cancellationToken)
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

                    var duplicatePosition = await _context.EmployeePositions
                        .Where(x => x.PositionName == updateRequest.PositionName
                        && x.Id != updateRequest.Id).FirstOrDefaultAsync();

                    if (duplicatePosition != null)
                    {
                        throw new DuplicateNameException("A position with this name already existed" +
                            ". Please choose a different name. " +
                            "(Existing position's id: " + duplicatePosition.Id + ")");
                    }

                    // Update the position name if provided
                    position.PositionName = updateRequest.PositionName!.Trim() ?? position.PositionName;

                    updatedPositions.Add(position);
                }

                _context.EmployeePositions.UpdateRange(updatedPositions);
                await _context.SaveChangesAsync(cancellationToken);

                return updatedPositions;
            }
        }
    }
}
