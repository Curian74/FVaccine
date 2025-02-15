using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public class EmployeePosition : BaseEntity
    {
        [Column("Position_Name")]
        public required string PositionName { get; set; }

        public bool Status { get; set; } = true;

        public ICollection<Employee>? Employees { get; set; }
    }
}
