
namespace VaccinationManagement.Models.DTOs
{
    public class QueryGetSchedulesByVaccineIdDTO
    {
        public required string VaccineId { get; set; }
        public string? SearchTerm { get; set; }
        public int? PageIndex { get; set; } = 1;
        public int? PageSize { get; set; } = 10;
    }
}
