using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.NewsFeature.Queries;
using VaccinationManagement.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace VaccinationManagement.Features.PositionFeature.Queries
{
    public class GetPositionsHandler : IRequestHandler<GetPositions, PositionListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetPositionsHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PositionListResult> Handle(GetPositions query, CancellationToken cancellationToken)
        {
            IQueryable<EmployeePosition> positionsQuery = _context.EmployeePositions.AsQueryable();

            // Filtering - Case-insensitive search
            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                string normalizedSearchTerm = query.SearchTerm.ToLower().Trim();
                positionsQuery = positionsQuery.Where(v =>
                v.PositionName.ToLower().Contains(normalizedSearchTerm));

            }

            positionsQuery = positionsQuery.Where(x => x.Status == query.Status);


            var totalPositions = await positionsQuery.CountAsync(cancellationToken);

            // Apply pagination
            var Positions = await positionsQuery
                .Skip((query.PageIndex - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(cancellationToken);

            return new PositionListResult
            {
                PositionList = Positions,
                TotalPositions = totalPositions,
            };
        }
    }
}
