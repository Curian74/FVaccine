using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsImageFeature.Queries
{
    public class GetNewsImageById : IRequest<NewsImages>
    {
        public required string? NewsId { get; set; }

        public class GetNewsImageHandler : IRequestHandler<GetNewsImageById, NewsImages>
        {
            private readonly ApplicationDbContext _context;

            public GetNewsImageHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<NewsImages> Handle(GetNewsImageById request, CancellationToken cancellationToken)
            {
                var newsImage = await _context.NewsImages.Where(x => x.NewsId == request.NewsId)
                    .FirstOrDefaultAsync();

                if(newsImage == null)
                {
                    throw new ArgumentException("Not found");
                }

                return newsImage;
            }
        }
    }
}
