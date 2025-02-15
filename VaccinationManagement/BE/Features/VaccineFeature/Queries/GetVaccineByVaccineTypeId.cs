using MediatR;
using VaccinationManagement.Models;
using System.Collections.Generic;
using VaccinationManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccineByVaccineTypeId : IRequest<VaccineListResult>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? VaccineTypeId { get; set; }
    }

    public class GetVaccineByVaccineTypeIdHandler : IRequestHandler<GetVaccineByVaccineTypeId, VaccineListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetVaccineByVaccineTypeIdHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<VaccineListResult> Handle(GetVaccineByVaccineTypeId query, CancellationToken cancellationToken)
        {
            var vaccinesQuery = _context.Vaccines.Where(v => v.Vaccine_Type_Id.Contains(query.VaccineTypeId ?? ""))
                                                 .Include(v => v.Vaccine_Type)
                                                 .AsQueryable();

            //Filtering Status Active
            vaccinesQuery = vaccinesQuery.Where(v => v.Status == true);

            // Filtering - Case-insensitive search
            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                string normalizedSearchTerm = query.SearchTerm.ToLower().Trim();

                vaccinesQuery = vaccinesQuery.Where(v =>
                    v.Vaccine_Name.ToLower().Contains(normalizedSearchTerm) ||
                    v.Description.ToLower().Contains(normalizedSearchTerm) ||
                    v.Id.ToLower().Contains(normalizedSearchTerm));
            }

            var totalVaccines = await vaccinesQuery.CountAsync(cancellationToken);

            // Apply pagination
            var vaccines = await vaccinesQuery
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(cancellationToken);

            return new VaccineListResult
            {
                Vaccines = vaccines,
                TotalVaccines = totalVaccines
            };
        }
    }
}
