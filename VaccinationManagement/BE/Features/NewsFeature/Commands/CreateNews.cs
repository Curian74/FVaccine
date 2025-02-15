using MediatR;
using VaccinationManagement.Data;
using VaccinationManagement.Features.VaccineFeature.Commands;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsFeature.Commands
{
    public class CreateNews : IRequest<News>
    {
        public required string Content { get; set; }
        public required string Title { get; set; }
        public required string Preview { get; set; }
        public DateTime PostDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string? AuthorId { get; set; }
        public string? News_Type_Id { get; set; }
        public string? Thumbnail { get; set; }

        public class CreateNewsHandler : IRequestHandler<CreateNews, News>
        {
            private readonly ApplicationDbContext _context;

            public CreateNewsHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<News> Handle(CreateNews request, CancellationToken cancellationToken)
            {
                var lastestId = _context.News.Max(x => x.Id);

                var newId = lastestId == null ? "NW000001" : NewId(lastestId);

                var newNews = new News
                {
                    Content = request.Content,
                    Title = request.Title,
                    Preview = request.Preview,
                    Id = newId,
                    PostDate = request.PostDate,
                    ExpiryDate = request.ExpiryDate,
                    AuthorId = request.AuthorId,
                    News_Type_Id = request.News_Type_Id,
                    Thumbnail = request.Thumbnail,
                };

                await _context.AddAsync(newNews);
                await _context.SaveChangesAsync();

                return newNews;
            }

            public string NewId(string id)
            {
                string s = id.Substring(2);
                while (s[0] == '0')
                {
                    s = s.Remove(0, 1);
                }
                int num = int.Parse(s) + 1;
                string rs = num.ToString();
                while (rs.Length < 6)
                {
                    rs = "0" + rs;
                }
                return "NW" + rs;
            }
        }
    }
}
