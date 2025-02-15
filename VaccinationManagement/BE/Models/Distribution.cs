using System.ComponentModel.DataAnnotations.Schema;

namespace VaccinationManagement.Models
{
    public class Distribution : BaseEntity
    {
        [ForeignKey("Vaccine")]
        public required string Vaccine_Id { get; set; }
        [ForeignKey("Place")]
        public required string Place_Id { get; set; }
        public required DateOnly Date_Import { get; set; }
        public int Quantity_Imported { get; set; }
        public int Quantity_Injected { get; set; }

        public virtual Vaccine? Vaccine { get; set; }
        public virtual Place? Place { get; set; }
    }

    public class Distribution_VacIdAndPlaceId : BaseEntity
    {
        [ForeignKey("Vaccine")]
        public required string Vaccine_Id { get; set; }
        [ForeignKey("Place")]
        public required string Place_Id { get; set; }
        public int Quantity_Imported { get; set; }
        public int Quantity_Injected { get; set; }

        public virtual Vaccine? Vaccine { get; set; }
        public virtual Place? Place { get; set; }
    }
}
