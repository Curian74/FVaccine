using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.NewsFeature.Commands;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsFeature.Queries
{
    public class GetNewsById : IRequest<News>
    {
        public required string Id { get; set; }
        public class GetNewsByIdHandler : IRequestHandler<GetNewsById, News>
        {
            private readonly ApplicationDbContext _context;

            public GetNewsByIdHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<News> Handle(GetNewsById request, CancellationToken cancellationToken)
            {
                var target = await _context.News.FirstOrDefaultAsync(n => n.Id == request.Id);

                if (target == null)
                {
                    throw new KeyNotFoundException("News not found");
                }

                return target;
            }
        }
    }
}
