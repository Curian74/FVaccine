using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsImageFeature.Queries
{

    public class GetNewsImagesByNewsIdResponse
    {
        public List<NewsImages>? NewsImages { get; set; }
    }


    public class GetNewsImagesByNewsId : IRequest<GetNewsImagesByNewsIdResponse>
    {

        public required string NewsId { get; set; }
        public class GetNewsImagesByNewsIdHandler : IRequestHandler<GetNewsImagesByNewsId,
            GetNewsImagesByNewsIdResponse>
        {
            private readonly ApplicationDbContext _context;

            public GetNewsImagesByNewsIdHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<GetNewsImagesByNewsIdResponse> Handle(GetNewsImagesByNewsId request,
                CancellationToken cancellationToken)
            {
                var newsImages = await _context.NewsImages.Where(x => x.NewsId == request.NewsId)
                    .ToListAsync();

                return new GetNewsImagesByNewsIdResponse
                {
                    NewsImages = newsImages,
                };
            }
        }
    }
}
