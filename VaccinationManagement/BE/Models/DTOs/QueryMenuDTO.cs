namespace VaccinationManagement.Models.DTOs
{
    public class QueryMenuDTO : QueryParameters
    {
        public bool? Status { get; set; }
        public string? Name { get; set; }
        public string? ParentId { get; set; }
    }

    public class Menus_Paged
    {
        public int CurrentPage { get; set; }

        public int TotalItems { get; set; }

        public int TotalPages { get; set; }

        public bool HasPreviousPage { get; set; }

        public bool HasNextPage { get; set; }

        public virtual ICollection<Menu>? Menus { get; set; }
    }
}
