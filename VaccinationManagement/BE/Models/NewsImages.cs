using System.Text.Json.Serialization;

namespace VaccinationManagement.Models
{
    public class NewsImages : BaseEntity
    {
        public required string ImagePath { get; set; }
        public required string NewsId { get; set; }

        [JsonIgnore]
        public News? News { get; set; }
    }
}
