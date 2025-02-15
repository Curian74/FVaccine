using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.EmployeeFeature.Queries
{
    public class GetEmployees : IRequest<EmployeeListResult>
    {
        public string? Name { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool Status { get; set; } = true;

    }

    public class EmployeeListResult
    {
        public List<Employee> Employees { get; set; }
        public int TotalEmployees { get; set; }

    }
}
