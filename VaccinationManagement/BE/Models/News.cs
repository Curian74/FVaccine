using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VaccinationManagement.Models
{
    public class News :BaseEntity
    {
        public required string Content { get; set; }
        public required string Title { get; set; }
        public required string Preview { get; set; }

        [ForeignKey("News_Type")]
        public string? News_Type_Id { get; set; }

        [ForeignKey("Employee")]
        public string? AuthorId { get; set; }

        public virtual Employee? Employee { get; set; }

        public virtual News_Type? News_Type { get; set; }

        public DateTime PostDate { get; set; }

        public DateTime ExpiryDate { get; set; }

        public bool Status { get; set; } = false;

        public string? Thumbnail { get; set; }

        [JsonIgnore]
        public virtual ICollection<NewsImages>? Images { get; set; }
    }
}
