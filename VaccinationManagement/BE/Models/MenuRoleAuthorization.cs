using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public class MenuRoleAuthorization
    {
        // [Key, Column(Order = 0)]
        public required string MenuId { get; set; }

        // [Key, Column(Order = 1)]
        public required int RoleId { get; set; }

        [ForeignKey("MenuId")]
        public virtual Menu? Menu { get; set; }

        [ForeignKey("RoleId")]
        public virtual UserRole? UserRole { get; set; }
    }
}
