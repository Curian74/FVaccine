namespace VaccinationManagement.Models.DTOs
{
    public class QueryMenuRoleAuthorizationDTO : QueryParameters
    {
        public string? MenuId { get; set; }
        public int? RoleId { get; set; }
    }

    public class MenuRoleAuthorization_Paged
    {
        public int CurrentPage { get; set; }

        public int TotalItems { get; set; }

        public int TotalPages { get; set; }

        public bool HasPreviousPage { get; set; }

        public bool HasNextPage { get; set; }

        public virtual ICollection<MenuRoleAuthorization>? MenuRoleAuthorizations { get; set; }
    }
}
