using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.NewsFeature.Queries;
using VaccinationManagement.Features.PositionFeature.Queries;
using VaccinationManagement.Models;
using static VaccinationManagement.Features.NewsTypeFeature.Queries.GetNewsType;

namespace VaccinationManagement.Features.NewsTypeFeature.Queries
{
    public class GetNewsTypesHandler : IRequestHandler<GetNewsType, NewsTypeListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetNewsTypesHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<NewsTypeListResult> Handle(GetNewsType query, CancellationToken cancellationToken)
        {
            IQueryable<News_Type> newsTypeQuery = _context.News_Types.AsQueryable();

            // Filtering - Case-insensitive search
            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                string normalizedSearchTerm = query.SearchTerm.ToLower().Trim();
                newsTypeQuery = newsTypeQuery.Where(v =>
                v.News_Type_Name.ToLower().Contains(normalizedSearchTerm));
            }

            newsTypeQuery = newsTypeQuery.Where(x => x.Status == query.Status);


            var totalNewsTypes = await newsTypeQuery.CountAsync(cancellationToken);

            // Apply pagination
            var NewsTypes = await newsTypeQuery
                .Skip((query.PageIndex - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(cancellationToken);

            return new NewsTypeListResult
            {
                NewsTypeList = NewsTypes,
                TotalNewsTypes = totalNewsTypes,
            };
        }
    }
}
