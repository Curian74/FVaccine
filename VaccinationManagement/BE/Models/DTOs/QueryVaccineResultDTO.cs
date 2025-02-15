namespace VaccinationManagement.Models.DTOs
{
    public class QueryVaccineResultsDTO : QueryParameters
    {
        public string? FromInjectDate { get; set; }
        public string? ToInjectDate { get; set; }
        public string? Prevention { get; set; }
        public string? VaccineTypeId { get; set; }
        public string? CustomerId { get; set; }
        public ResultStatus? Status { get; set; }
        public int? Injection_Number { get; set; }
        public string? VaccineId { get; set; }
        // public QueryVaccineResultDTO()
        // {
        //     OrderBy = "CreatedAt";
        // }
    }
}
