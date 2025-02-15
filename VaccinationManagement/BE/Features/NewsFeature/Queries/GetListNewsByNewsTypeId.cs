using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace VaccinationManagement.Features.NewsFeature.Queries
{
    public class GetListNewsByNewsTypeId : IRequest<NewsListResult>
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool Status { get; set; } = true;
        public required string NewsTypeId { get; set; }
        public string NewsId { get; set; } = "";

    }

    public class GetListNewsByNewsTypeIdHandler : IRequestHandler<GetListNewsByNewsTypeId, NewsListResult>
    {
        private readonly ApplicationDbContext _context;

        public GetListNewsByNewsTypeIdHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<NewsListResult> Handle(GetListNewsByNewsTypeId request, CancellationToken cancellationToken)
        {
            var newsQuery = _context.News.AsQueryable();

            newsQuery = newsQuery.Where(n => n.Status == request.Status);
            newsQuery = newsQuery.Where(n => n.News_Type_Id == request.NewsTypeId && n.Id != request.NewsId);

            var totalNews = await newsQuery.CountAsync(cancellationToken);

            var newsList = await newsQuery
                .OrderByDescending(x => x.PostDate)
                .Skip((request.PageIndex - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new NewsListResult
            {
                NewsList = newsList,
                TotalNews = totalNews,
            };
        }

    }
}
