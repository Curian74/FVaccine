namespace VaccinationManagement.Models
{
    public class UserRole
    {
        public int Id { get; set; }

        public required string Role_Name { get; set; }

        public virtual ICollection<Employee>? Employees { get; set; }
        public virtual ICollection<Customer>? Customers { get; set; }
    }
}
