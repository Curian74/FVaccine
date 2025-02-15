using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public class Customer : BaseEntity
    {
        [MaxLength(255)]
        public required string Address { get; set; }
        public required string Province { get; set; }
        public required string District { get; set; }
        public required string Ward { get; set; }

        public required DateOnly Date_Of_Birth { get; set; }
        [MaxLength(100)]
        public required string Full_Name { get; set; }
        [MaxLength(100)]
        public required string Email { get; set; }
        [Range(0,10)]
        public int? Gender { get; set; }
        [MaxLength(20)]
        public required string Phone { get; set; }
        [MaxLength(12)]
        public required string Identity_Card {  get; set; }
        [MaxLength(255)]
        public required string Password { get; set; }
        [MaxLength(255)]
        public required string Username { get; set; }

        public string? Image { get; set; }

        public bool Status { get; set; } = true;

        public string? EmailChangeToken { get; set; }
        public DateTime? EmailChangeTokenExpiry { get; set; }
        public string? RefreshToken { get; set; } = string.Empty;
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public virtual ICollection<Injection_Result>? Injection_Results { get; set; }

        [ForeignKey("UserRole")]
        public int Role_Id { get; set; } = 1;
        public virtual UserRole? UserRole { get; set; }
    }
}
