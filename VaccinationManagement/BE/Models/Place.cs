using System.ComponentModel.DataAnnotations;

namespace VaccinationManagement.Models
{
    public class Place : BaseEntity
    {
        [MaxLength(255)]
        public required string Name { get; set; }

        public bool Status { get; set; } = true;
        public string Address { get; set; } = string.Empty;
    }

    public class Places_Paged
    {
        public int CurrentPage { get; set; }

        public int TotalItems { get; set; }

        public int TotalPages { get; set; }

        public bool HasPreviousPage { get; set; }

        public bool HasNextPage { get; set; }

        public virtual ICollection<Place>? Places { get; set; }
    }
}
