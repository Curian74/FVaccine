using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsTypeFeature.Commands
{
    public class CreateNewsType : IRequest<News_Type>
    {
        public required string News_Type_Name { get; set; }

        public class CreateNewsTypeHandler : IRequestHandler<CreateNewsType, News_Type>
        {
            private readonly ApplicationDbContext _context;

            public CreateNewsTypeHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<News_Type> Handle(CreateNewsType request, CancellationToken cancellationToken)
            {
                foreach (var nt in _context.News_Types)
                {
                    if (nt.News_Type_Name == request.News_Type_Name)
                    {
                        throw new DuplicateNameException($"A news type with this name already existed" +
                        ". Please choose a different name. " +
                        "(Existing news type's id: " + nt.Id + ")");
                    }
                }

                var lastestId = _context.News_Types.Max(x => x.Id);
                var newId = lastestId == null ? "NT000001" : NewId(lastestId);

                var newNewsType = new News_Type
                {
                    Id = newId,
                    News_Type_Name = request.News_Type_Name.Trim(),
                    Status = true,
                };

                await _context.AddAsync(newNewsType);
                await _context.SaveChangesAsync();

                return newNewsType;
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
                return "NT" + rs;
            }
        }
    }
}
