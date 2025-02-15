using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class GetCustomerFilterQuery : IRequest<GetCustomerFilterResponse>
    {
        public required QueryCustomerDTO query { get; set; }
    }

	public class GetCustomerFilterResponse
	{
		public int CurrentPage { get; set; }

		public int TotalItems { get; set; }

		public int TotalPages { get; set; }

		public virtual ICollection<CustomerDTO>? Customers { get; set; }
	}

	public class GetCustomerFilter : IRequest<GetCustomerFilterResponse>
    {
        public class GetCustomerFilterHandler : IRequestHandler<GetCustomerFilterQuery, GetCustomerFilterResponse>
        {
            private readonly ApplicationDbContext _context;
            public GetCustomerFilterHandler(ApplicationDbContext context)
            {
                _context = context;
            }

			public async Task<GetCustomerFilterResponse> Handle(GetCustomerFilterQuery request, CancellationToken cancellationToken)
			{
				IQueryable<Customer> query = _context.Customers.Include(c => c.Injection_Results);

				if (!string.IsNullOrEmpty(request.query.FullName))
				{
					query = query.Where(c => c.Full_Name.Contains(request.query.FullName));
				}
				if (!string.IsNullOrEmpty(request.query.Address))
				{
					query = query.Where(c => c.Address.Contains(request.query.Address));
				}

				if (!string.IsNullOrEmpty(request.query.FromDOB) &&
					DateOnly.TryParse(request.query.FromDOB, out DateOnly fromDate))
				{
					query = query.Where(c => c.Date_Of_Birth >= fromDate);
				}

				if (!string.IsNullOrEmpty(request.query.ToDOB) &&
					DateOnly.TryParse(request.query.ToDOB, out DateOnly toDate))
				{
					query = query.Where(c => c.Date_Of_Birth <= toDate);
				}

				var totalEntities = await query.CountAsync(cancellationToken);

				var customers = await query
					.OrderBy(c => c.Id)
					.Skip((request.query.pageIndex - 1) * request.query.PageSize)
					.Take(request.query.PageSize)
					.ToListAsync(cancellationToken);
				var customerDto = customers.Select(c => new CustomerDTO
				{
					Id = c.Id,
					Date_Of_Birth = c.Date_Of_Birth,
					Full_Name = c.Full_Name,
					Address = c.Address,
					Identity_Card = c.Identity_Card,
					Number_Of_Injection = c.Injection_Results?.Sum(i => i.Number_Of_Injection) ?? 0
				}).ToList();

				var paginatedList = new PaginatedList<CustomerDTO>(customerDto, totalEntities, request.query.pageIndex, request.query.PageSize);

				return new GetCustomerFilterResponse
				{
					CurrentPage = paginatedList.PageIndex,
					TotalItems = paginatedList.TotalItems,
					TotalPages = paginatedList.TotalPages,
					Customers = paginatedList
				};
			}

		}

	}
}
