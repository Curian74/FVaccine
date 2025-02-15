using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public class Employee : BaseEntity
    {
        [MaxLength(255)]
        public string? Address { get; set; }

        public string? WardId { get; set; }

        public string? DistrictId { get; set; }

        public string? ProvinceId { get; set; }

        public DateOnly? Date_Of_Birth { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }
        [Range(0,10)]
        public int? Gender { get; set; }
        [MaxLength(255)]
        public string Image { get; set; } = string.Empty;
        [MaxLength(255)]
        public required string Password { get; set; }
        [MaxLength(100)]
        public EmployeePosition? Position { get; set; }
        [ForeignKey("Place")]
        public required string Place_Id { get; set; }
        [MaxLength(255)]
        public required string Username { get; set; }
        [MaxLength(100)]
        public required string Employee_Name { get; set; }

        [ForeignKey("UserRole")]
        public int Role_Id { get ; set; }
    
        public string? Phone { get; set;}

        public bool Status { get; set; } = true;

        public required string PositionId { get; set; }

        public virtual Place? Place { get; set; }
        public string? RefreshToken { get; set; } = string.Empty;
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public virtual UserRole? UserRole { get; set; }

        public ICollection<News>? News { get; set; }

    }
}
