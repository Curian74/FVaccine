using System.ComponentModel.DataAnnotations;

namespace VaccinationManagement.Models
{
    public class News_Type : BaseEntity
    {
        [MaxLength(50)]
        public required string News_Type_Name { get; set; }

        public bool Status { get; set; } = false;

        public virtual ICollection<News>? News { get; set; }
    }
}
