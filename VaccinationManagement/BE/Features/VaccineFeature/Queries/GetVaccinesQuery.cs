using MediatR;
using VaccinationManagement.Models;
using System.Collections.Generic;

namespace VaccinationManagement.Features.VaccineFeature.Queries
{
    public class GetVaccinesQuery : IRequest<VaccineListResult>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 5;
        public string? SearchTerm { get; set; }
        public bool IsActive { get; set; }
    }

    public class VaccineListResult
    {
        public List<Vaccine> Vaccines { get; set; }
        public int TotalVaccines { get; set; }
    }
}
