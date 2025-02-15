using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.ScheduleFeature.Queries
{
    public class PaginatedScheduleResponse
    {
        public int PageIndex { get; set; }
        public int TotalPages { get; set; }
        public List<Injection_Schedule>? Items { get; set; }
    }

    public class GetSchedulesByVaccineIdQuery : IRequest<PaginatedScheduleResponse>
    {
        public required QueryGetSchedulesByVaccineIdDTO query;
        public class GetVaccineTypesHandler : IRequestHandler<GetSchedulesByVaccineIdQuery, PaginatedScheduleResponse>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccineTypesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<PaginatedScheduleResponse> Handle(GetSchedulesByVaccineIdQuery request, CancellationToken cancellationToken)
            {
                var today = DateOnly.FromDateTime(DateTime.Now);

                var validPlaceIds = await _context.Distributions
                    .Where(d => d.Vaccine_Id == request.query.VaccineId)
                    .GroupBy(d => d.Place_Id)
                    .Where(g => g.Sum(d => d.Quantity_Imported - d.Quantity_Injected) > 0)
                    .Select(g => g.Key)
                    .ToListAsync(cancellationToken);

                var data = _context.Injection_Schedules
                    .Include(i => i.Place)
                    .Include(i => i.Vaccine)
                    .Where(i =>
                        validPlaceIds.Contains(i.Place_Id) &&
                        i.Vaccine_Id == request.query.VaccineId &&
                        i.End_Date >= today)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(request.query.SearchTerm))
                {
                    data = data.Where(v =>
                        v.Place!.Name.Contains(request.query.SearchTerm) ||
                        v.Description!.Contains(request.query.SearchTerm));
                }

                if (request.query.PageIndex == null || request.query.PageSize == null)
                {
                    var items = await data
                        .OrderBy(x => x.Start_Date)
                        .ThenBy(x => x.Id)
                        .ToListAsync(cancellationToken);

                    return new PaginatedScheduleResponse
                    {
                        PageIndex = 1,
                        TotalPages = 1,
                        Items = items
                    };
                }
                else
                {
                    var count = await data.CountAsync(cancellationToken);

                    var items = await data
                        .OrderBy(x => x.Start_Date)
                        .ThenBy(x => x.Id)
                        .Skip((request.query.PageIndex.Value - 1) * request.query.PageSize.Value)
                        .Take(request.query.PageSize.Value)
                        .ToListAsync(cancellationToken);

                    var totalPages = (int)Math.Ceiling(count / (double)request.query.PageSize.Value);

                    return new PaginatedScheduleResponse
                    {
                        PageIndex = request.query.PageIndex.Value,
                        TotalPages = totalPages,
                        Items = items
                    };
                }
            }


        }
    }
}
