// using MediatR;
// using Microsoft.EntityFrameworkCore;
// using VaccinationManagement.Data;

// namespace VaccinationManagement.Features.NewsFeature.Commands
// {
//     public class UpdateNewsStatus : IRequest<bool>
//     {
//         public List<string> NewsId { get; set; }

//         public class UpdateNewsStatusHandler : IRequestHandler<UpdateNewsStatus, bool>
//         {
//             private readonly ApplicationDbContext _context;

//             public UpdateNewsStatusHandler(ApplicationDbContext context)
//             {
//                 _context = context;
//             }

//             public async Task<bool> Handle(UpdateNewsStatus request, CancellationToken cancellationToken)
//             {
//                 // Retrieve all news with the specified IDs
//                 var newsToUpdate = await _context.News
//                     .Where(v => request.NewsId.Contains(v.Id))
//                     .ToListAsync();

//                 if (newsToUpdate == null || newsToUpdate.Count == 0)
//                     return false;

//                 foreach (var n in newsToUpdate)
//                 {
//                     n.Status = !n.Status;
//                     _context.News.Update(n);
//                 }

//                 await _context.SaveChangesAsync(cancellationToken);

//                 return true;
//             }
//         }
//     }
// }
