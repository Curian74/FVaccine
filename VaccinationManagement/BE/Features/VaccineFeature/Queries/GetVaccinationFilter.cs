using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.CustomerFeature.Queries;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccinationFilterQuery : IRequest<GetVaccineFilterResponse>
    {
        public required QueryVaccineDTO query { get; set; }
    }

	public class GetVaccineFilterResponse
	{
		public int CurrentPage { get; set; }

		public int TotalItems { get; set; }

		public int TotalPages { get; set; }

		public virtual ICollection<VaccineResponse>? Vaccines { get; set; }
	}

	public class GetVaccineFilter : IRequest<GetVaccineFilterResponse>
    {
        public class GetVaccineFilterHandler : IRequestHandler<GetVaccinationFilterQuery, GetVaccineFilterResponse>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccineFilterHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<GetVaccineFilterResponse> Handle(GetVaccinationFilterQuery request, CancellationToken cancellationToken)
            {
				IQueryable<Vaccine> query = _context.Vaccines.Include(c => c.Vaccine_Type);
				if (!string.IsNullOrEmpty(request.query.Origin))
				{
					query = query.Where(c => c.Origin!.Contains(request.query.Origin.Trim()));
				}
				if (!string.IsNullOrEmpty(request.query.Keyword))
				{
					query = query.Where(c => c.Vaccine_Name!.Contains(request.query.Keyword));
				}
				if (!string.IsNullOrEmpty(request.query.FromNextInjectDate) &&
					DateOnly.TryParse(request.query.FromNextInjectDate, out DateOnly fromDate))
				{
					query = query.Where(c => c.Time_Begin_Next_Injection >= fromDate);
				}

				if (!string.IsNullOrEmpty(request.query.ToNextInjectDate) &&
					DateOnly.TryParse(request.query.ToNextInjectDate, out DateOnly toDate))
				{
					query = query.Where(c => c.Time_End_Next_Injection <= toDate);
				}
				if (!string.IsNullOrEmpty(request.query.VaccineTypeId))
				{
					query = query.Where(c => c.Vaccine_Type_Id == request.query.VaccineTypeId);
				}
				if (request.query.Status != null)
				{
					query = query.Where(c => c.Status == request.query.Status);
				}
				if (!string.IsNullOrEmpty(request.query.Name))
				{
					query = query.Where(c => c.Vaccine_Name.Contains(request.query.Name));
				}

				var totalEntities = await query.CountAsync(cancellationToken);

				var vaccines = await query
					.OrderBy(c => c.Id)
					.Skip((request.query.pageIndex - 1) * request.query.PageSize)
					.Take(request.query.PageSize)
					.ToListAsync(cancellationToken);
				var vaccineDto = vaccines.Select(c => new VaccineResponse
				{
					Id = c.Id,
					Vaccine_Name = c.Vaccine_Name,
					Vaccine_Type_Name = c.Vaccine_Type!.Vaccine_Type_Name,
					Time_Begin_Next_Injection = c.Time_Begin_Next_Injection,
					Time_End_Next_Injection = c.Time_End_Next_Injection,
					Origin = c.Origin,
					Number_Of_Injection = c.Number_Of_Injection,
					Purchase_Price = c.Purchase_Price,
					Selling_Price = c.Selling_Price,
				}).ToList();

				var paginatedList = new PaginatedList<VaccineResponse>(vaccineDto, totalEntities, request.query.pageIndex, request.query.PageSize);

				return new GetVaccineFilterResponse
				{
					CurrentPage = paginatedList.PageIndex,
					TotalItems = paginatedList.TotalItems,
					TotalPages = paginatedList.TotalPages,
					Vaccines = paginatedList
				};
			}
        }

    }
}
