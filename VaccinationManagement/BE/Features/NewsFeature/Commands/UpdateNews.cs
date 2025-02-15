using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsFeature.Commands
{
    public class UpdateNews : IRequest<News>
    {
        public string? Id { get; set; }
        public string? Content { get; set; }
        public string? Title { get; set; }
        public string? Preview { get; set; }

        public string? News_Type_Id { get; set; }

        public bool? Status { get; set; }

        public DateTime PostDate { get; set; }

        public DateTime ExpiryDate { get; set; }

        public string? Thumbnail { get; set; }

        public class UpdateNewsHandler : IRequestHandler<UpdateNews, News>
        {
            private readonly ApplicationDbContext _context;

            public UpdateNewsHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<News> Handle(UpdateNews request, CancellationToken cancellationToken)
            {
                var news = await _context.News.FirstOrDefaultAsync(n => n.Id == request.Id);

                if (news == null)
                {
                    throw new ArgumentException("News not found");
                }

                news.Content = request.Content ?? news.Content;
                news.Title = request.Title ?? news.Title;
                news.Preview = request.Preview ?? news.Preview;
                news.News_Type_Id = request.News_Type_Id;
                news.ExpiryDate = request.ExpiryDate;
                news.PostDate = request.PostDate;
                news.Thumbnail = request.Thumbnail;
                
                await _context.SaveChangesAsync();

                return news;
            }
        }
    }
}
