using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using VaccinationManagement.Data;
using VaccinationManagement.Features.PositionFeature.Commands;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.PositionFeature.Commands
{
    public class CreatePosition: IRequest<EmployeePosition>
    {
        public required string EmployeePositionName { get; set; }

        public class CreatePositionHandler : IRequestHandler<CreatePosition, EmployeePosition>
        {
            private readonly ApplicationDbContext _context;

            public CreatePositionHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<EmployeePosition> Handle(CreatePosition request, CancellationToken cancellationToken)
            {
                foreach(var pos in  _context.EmployeePositions)
                {
                    if(pos.PositionName == request.EmployeePositionName)
                    {
                        throw new DuplicateNameException($"A position with this name already existed" +
                        ". Please choose a different name. " +
                        "(Existing position's id: " + pos.Id + ")");
                    }
                }

                var lastestId = _context.EmployeePositions.Max(x => x.Id);
                IDFormatter idFormater = new();
                var newId = lastestId == null ? "PO000001" : idFormater.NewId(lastestId);

                var newPosition = new EmployeePosition
                {
                    Id = newId,
                    PositionName = request.EmployeePositionName.Trim(),
                    Status = true,
                };

                await _context.AddAsync(newPosition);
                await _context.SaveChangesAsync();

                return newPosition;
            }
        }
    }
}
