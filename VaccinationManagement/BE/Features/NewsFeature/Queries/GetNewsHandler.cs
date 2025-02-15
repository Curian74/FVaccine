using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.CustomerFeature.Queries;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace VaccinationManagement.Features.NewsFeature.Queries
{
    public class GetNewsHandler : IRequestHandler<GetNews, NewsListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetNewsHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<NewsListResult> Handle(GetNews query, CancellationToken cancellationToken)
        {
            var newsQuery = _context.News.AsQueryable();

            // Filtering - Case-insensitive search
            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                string normalizedSearchTerm = query.SearchTerm.ToLower().Trim();

                newsQuery = newsQuery.Where(v =>
                    v.Id.ToLower().Contains(normalizedSearchTerm));
            }

            newsQuery = newsQuery.Where(n => n.Status == query.Status);

            var totalNews = await newsQuery.CountAsync(cancellationToken);

            // Apply pagination
            var News = await newsQuery
                .Skip((query.PageIndex - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(cancellationToken);

            return new NewsListResult
            {
                NewsList = News,
                TotalNews = totalNews,
            };
        }
    }
}
