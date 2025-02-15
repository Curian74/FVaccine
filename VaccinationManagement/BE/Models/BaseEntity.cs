using System.ComponentModel.DataAnnotations;

namespace VaccinationManagement.Models
{
    public class BaseEntity
    {
        [Key]
        public required string Id { get; set; }
    }
}
