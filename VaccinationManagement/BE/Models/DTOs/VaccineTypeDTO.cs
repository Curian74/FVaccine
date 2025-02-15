namespace VaccinationManagement.Models.DTOs
{
	public class CreateVaccineTypeDTO
	{
		public required string Id { get; set; }
		public string? Description { get; set; }

		public required string Vaccine_Type_Name { get; set; }

		public string? Image { get; set; }

		public bool Status { get; set; } = true;
	}
}
