using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsTypeFeature.Commands
{
    public class ChangeNewsTypesStatus : IRequest<List<News_Type>>
    {
        public List<NewsTypeStatusRequest>? NewsTypes { get; set; }

        public class NewsTypeStatusRequest
        {
            public string? Id { get; set; }
        }

        public class ChangeNewsTypesStatusHandler : IRequestHandler<ChangeNewsTypesStatus, List<News_Type>>
        {
            private readonly ApplicationDbContext _context;

            public ChangeNewsTypesStatusHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<List<News_Type>> Handle(ChangeNewsTypesStatus request, CancellationToken cancellationToken)
            {
                var updatedNewsTypes = new List<News_Type>();

                foreach (var updateRequest in request.NewsTypes!)
                {
                    var newsType = await _context.News_Types.FirstOrDefaultAsync(
                        x => x.Id == updateRequest.Id, cancellationToken);

                    if (newsType == null)
                    {
                        throw new ArgumentException($"News Type with ID {updateRequest.Id} not found");
                    }

                    newsType.Status = !newsType.Status;

                    updatedNewsTypes.Add(newsType);
                }

                _context.News_Types.UpdateRange(updatedNewsTypes);
                await _context.SaveChangesAsync(cancellationToken);

                return updatedNewsTypes;
            }
        }
    }
}
