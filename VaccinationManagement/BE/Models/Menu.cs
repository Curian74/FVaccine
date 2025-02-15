using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public class Menu : BaseEntity
    {
        [MaxLength(255)]
        public required string Name { get; set; }
        [MaxLength(255)]
        public string? Path { get; set; }
        [MaxLength(255)]
        public string? Icon { get; set; }

        public string? ParentID { get; set; }

        public bool Status { get; set; } = true;

        public virtual ICollection<MenuRoleAuthorization>? MenuRoleAuthorizations { get; set; }

        [NotMapped]
        public ICollection<int>? AuthorizedRoles { get; set; } = null;
    }
}
