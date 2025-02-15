using System.ComponentModel.DataAnnotations;

namespace VaccinationManagement.Models.DTOs
{
    public class QueryCustomerDTO : QueryParameters
    {
        public string? FromDOB { get; set; }
        public string? ToDOB { get; set; }
        public string? FullName { get; set; }
        public string? Address { get; set; }
    }

    public class CustomerDTO
    {
		public required string Id { get; set; }
		public required string Address { get; set; }
		public required DateOnly Date_Of_Birth { get; set; }
		public required string Full_Name { get; set; }
		public required string Identity_Card { get; set; }
		public required int Number_Of_Injection { get; set; }
	}
}
