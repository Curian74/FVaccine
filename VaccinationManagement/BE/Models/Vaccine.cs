using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VaccinationManagement.Models
{
    public class Vaccine : BaseEntity
    {
        [MaxLength(200)]
        public string? Contraindication { get; set; }
        [MaxLength(200)]
        public string? Indication { get; set; }
        [Range(0, 10)]
        public int? Number_Of_Injection { get; set; }
        [MaxLength(50)]
        public string? Origin { get; set; }

        public DateOnly? Time_Begin_Next_Injection { get; set; }

        public DateOnly? Time_End_Next_Injection { get; set; }
        [MaxLength(200)]
        public string? Usage { get; set; }
        [MaxLength(100)]
        public required string Vaccine_Name { get; set; }

        public int Purchase_Price { get; set; }
        public int Selling_Price { get; set; }
        public string? Image { get; set; }
        public string? Description { get; set; }
        public required int Required_Injections { get; set; }
        public int? Time_Between_Injections { get; set; }
        public bool Status { get; set; } = true;

        [ForeignKey("Vaccine_Type")]
        public required string Vaccine_Type_Id { get; set; }

        public virtual Vaccine_Type? Vaccine_Type { get; set; }

        [JsonIgnore]
        public virtual ICollection<Injection_Schedule>? Injection_Schedules { get; set; }

        public virtual ICollection<Injection_Result>? Injection_Results { get; set; }
    }
}
