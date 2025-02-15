using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public enum ResultStatus
    {
        NotInjected = 1,
        Injected = 2,
        Cancelled = 3,
    }

    public class Injection_Result : BaseEntity
    {
        [ForeignKey("Customer")]
        public required string Customer_Id { get; set; }

        public DateOnly? Injection_Date { get; set; }

        [ForeignKey("Injection_Place")]
        public string? Injection_Place_Id { get; set; }

        public DateOnly? Next_Injection_Date { get; set; }

        [MaxLength(100)]
        public int Number_Of_Injection { get; set; } = 0;

        [MaxLength(100)]
        public int Injection_Number { get; set; } = 0;

        [MaxLength(100)]
        public required string Prevention {  get; set; }

        [ForeignKey("Vaccine")]
        public required string Vaccine_Id { get; set; }

        public ResultStatus IsVaccinated { get; set; } = ResultStatus.NotInjected;

        public virtual Customer? Customer { get; set; }

        public virtual Vaccine? Vaccine { get; set; }

        public virtual Place? Injection_Place { get; set; }
    }

    public class Injection_Results_Paged
    {
        public int CurrentPage { get; set; }

        public int TotalItems { get; set; }

        public int TotalPages { get; set; }

        public bool HasPreviousPage { get; set; }

        public bool HasNextPage { get; set; }

        public virtual ICollection<Injection_Result>? Injection_Results { get; set; }
    }
}
