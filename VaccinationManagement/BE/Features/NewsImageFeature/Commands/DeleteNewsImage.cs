using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsImageFeature.Commands
{
    public class DeleteNewsImage : IRequest<IEnumerable<NewsImages>>
    {
        public List<string>? NewsImageIds { get; set; }

        public class DeleteNewsImageHandler : IRequestHandler<DeleteNewsImage, IEnumerable<NewsImages>>
        {
            private readonly ApplicationDbContext _context;

            public DeleteNewsImageHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<NewsImages>> Handle(DeleteNewsImage request, CancellationToken cancellationToken)
            {
                var deleteList = new List<NewsImages>();

                var imageList = await _context.NewsImages.ToListAsync(cancellationToken);

                foreach(var img in imageList)
                {
                    if (request.NewsImageIds!.Contains(img.Id))
                    {
                        deleteList.Add(img);
                    }
                }

                if (deleteList == null)
                {
                    throw new KeyNotFoundException("Image not found");
                }

                _context.NewsImages.RemoveRange(deleteList);
                await _context.SaveChangesAsync();

                return deleteList;
            }
        }
    }
}
