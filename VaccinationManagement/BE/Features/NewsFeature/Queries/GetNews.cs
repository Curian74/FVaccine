using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.NewsFeature.Queries
{
    public class GetNews : IRequest<NewsListResult>
    {
        public string? SearchTerm { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool Status { get; set; } = true;
    }

    public class NewsListResult
    {
        public List<News>? NewsList { get; set; }
        public int TotalNews { get; set; }
    }
}
