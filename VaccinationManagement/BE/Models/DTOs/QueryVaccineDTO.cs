using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VaccinationManagement.Models.DTOs
{
    public class QueryVaccineDTO : QueryParameters
    {
        public string? Keyword { get; set; }
        public string? FromNextInjectDate { get; set; }
        public string? ToNextInjectDate { get; set; }
        public string? Origin { get; set; }
        public string? VaccineTypeId { get; set; }
        public bool? Status { get; set; }
        public string? Name { get; set; }
    }

    public class VaccineResponse
    {
        public required string Id { get; set; }
        public required string Vaccine_Name { get; set; }

        public int? Number_Of_Injection { get; set; }
        public string? Origin { get; set; }

        public DateOnly? Time_Begin_Next_Injection { get; set; }

        public DateOnly? Time_End_Next_Injection { get; set; }
        public required string Vaccine_Type_Name { get; set; }
        public required double Purchase_Price { get; set; }
        public required double Selling_Price { get; set; }

    }
}
