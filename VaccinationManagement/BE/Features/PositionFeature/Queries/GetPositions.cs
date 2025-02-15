using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.PositionFeature.Queries
{

    public class GetPositions : IRequest<PositionListResult>
    {
        public string? SearchTerm { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool Status { get; set; } = true;
    }

    public class PositionListResult
    {
        public List<EmployeePosition> PositionList { get; set; }
        public int TotalPositions { get; set; }

    }

}
