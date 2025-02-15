using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public enum ScheduleStatus
    {
        NotYet,
        Open,
        Over,
    }

    public class Injection_Schedule : BaseEntity
    {
        [MaxLength(1000)]
        public string? Description { get; set; }

        public required DateOnly End_Date { get; set; }

        [ForeignKey("Place")]
        public required string Place_Id { get; set; }

        public required DateOnly Start_Date { get; set; }

        [ForeignKey("Vaccine")]
        public required string Vaccine_Id { get; set; }

        public virtual Vaccine? Vaccine { get; set; }

        public virtual Place? Place { get; set; }
    }
}
