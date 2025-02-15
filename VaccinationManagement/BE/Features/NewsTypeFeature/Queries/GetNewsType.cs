using MediatR;
using VaccinationManagement.Models;
using static VaccinationManagement.Features.NewsTypeFeature.Queries.GetNewsType;

namespace VaccinationManagement.Features.NewsTypeFeature.Queries
{
    public class GetNewsType : IRequest<NewsTypeListResult>
    {
        public string? SearchTerm { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool Status { get; set; } = true;

        public class NewsTypeListResult
        {
            public List<News_Type>? NewsTypeList { get; set; }
            public int TotalNewsTypes { get; set; }

        }
    }
}
