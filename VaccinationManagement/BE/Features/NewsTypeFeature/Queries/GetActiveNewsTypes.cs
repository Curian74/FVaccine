using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsTypeFeature.Queries
{
    public class GetActiveNewsTypes : IRequest<IEnumerable<News_Type>>
    {
        public class GetActiveNewsTypesHandler : IRequestHandler<GetActiveNewsTypes, IEnumerable<News_Type>>
        {
            private readonly ApplicationDbContext _context;

            public GetActiveNewsTypesHandler(ApplicationDbContext context)
            {
                _context = context;
            }


            public async Task<IEnumerable<News_Type>> Handle(GetActiveNewsTypes request, CancellationToken cancellationToken)
            {
                var newsTypes = await _context.News_Types.Where(x => x.Status).ToListAsync();

                return newsTypes;
            }
        }
    }
}
