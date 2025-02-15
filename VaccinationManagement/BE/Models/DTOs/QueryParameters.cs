namespace VaccinationManagement.Models.DTOs
{
    public abstract class QueryParameters
    {
        public int pageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 5;
        public string OrderBy { get; set; } = string.Empty;
    }
}
