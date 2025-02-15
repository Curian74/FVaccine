using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VaccinationManagement.Models
{
    public class Vaccine_Type 
    {
        [Key][MaxLength(36)]
        public required string Id { get; set; }
        [MaxLength(200)]
        public string? Description { get; set; }
        [MaxLength(50)]
        public required string Vaccine_Type_Name { get; set; }

        public string? Image { get; set; }

        public bool Status { get; set; } = true;

        [JsonIgnore]
        public virtual ICollection<Vaccine>? Vaccines { get; set; }
    }
}
