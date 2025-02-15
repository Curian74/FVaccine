using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsTypeFeature.Commands
{
    public class UpdateNewsType : IRequest<List<News_Type>>
    {
        public List<NewsTypeUpdateRequest>? NewsTypes { get; set; }

        // Define a nested class to hold individual update details
        public class NewsTypeUpdateRequest
        {
            public string? Id { get; set; }
            public required string News_Type_Name { get; set; }
        }

        public class UpdatePositionHandler : IRequestHandler<UpdateNewsType, List<News_Type>>
        {
            private readonly ApplicationDbContext _context;

            public UpdatePositionHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<List<News_Type>> Handle(UpdateNewsType request, CancellationToken cancellationToken)
            {
                var updatedNewsTypes = new List<News_Type>();

                foreach (var updateRequest in request.NewsTypes!)
                {
                    var newsType = await _context.News_Types.FirstOrDefaultAsync(
                        x => x.Id == updateRequest.Id, cancellationToken);

                    if (newsType == null)
                    {
                        throw new ArgumentException($"News type with ID {updateRequest.Id} not found");
                    }

                    var duplicateNewsType = await _context.News_Types
                        .Where(x => x.News_Type_Name == updateRequest.News_Type_Name
                        && x.Id != updateRequest.Id).FirstOrDefaultAsync();

                    if (duplicateNewsType != null)
                    {
                        throw new DuplicateNameException("A news type with this name already existed" +
                            ". Please choose a different name. " +
                            "(Existing news type's id: " + duplicateNewsType.Id + ")");
                    }

                    // Update the news type name if provided
                    newsType.News_Type_Name = updateRequest.News_Type_Name.Trim() ?? newsType.News_Type_Name;

                    updatedNewsTypes.Add(newsType);
                }

                _context.News_Types.UpdateRange(updatedNewsTypes);
                await _context.SaveChangesAsync(cancellationToken);

                return updatedNewsTypes;
            }
        }
    }
}
