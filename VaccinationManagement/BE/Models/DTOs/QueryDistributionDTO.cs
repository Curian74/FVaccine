namespace VaccinationManagement.Models.DTOs
{
    public class QueryDistributionDTO : QueryParameters
    {
        public string? VaccineId { get; set; }
        public string? PlaceId { get; set; }
        public string? PlaceName { get; set; }
        public DateOnly? DateRangeStart { get; set; }
        public DateOnly? DateRangeEnd { get; set; }
        public int? MinQuantity { get; set; }
        public int? MinImportedQuantity { get; set; }
        public int? MinInjectedQuantity { get; set; }
    }

    public class Distributions_Paged
    {
        public int CurrentPage { get; set; }

        public int TotalItems { get; set; }

        public int TotalPages { get; set; }

        public bool HasPreviousPage { get; set; }

        public bool HasNextPage { get; set; }

        public virtual ICollection<Distribution>? Distributions { get; set; }
    }

    public class Distributions_VacIdAndPlaceId_Paged
    {
        public int CurrentPage { get; set; }

        public int TotalItems { get; set; }

        public int TotalPages { get; set; }

        public bool HasPreviousPage { get; set; }

        public bool HasNextPage { get; set; }

        public virtual ICollection<Distribution_VacIdAndPlaceId>? Distributions { get; set; }
    }
}
