using MediatR;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Commands
{
    public class CreateVaccine : IRequest<string>
    {
        public required string Id { get; set; }

        public string? Contraindication { get; set; }
        public string? Indication { get; set; }
        public int? Number_Of_Injection { get; set; }
        public string? Origin { get; set; }
        public DateOnly? Time_Begin_Next_Injection { get; set; }
        public DateOnly? Time_End_Next_Injection { get; set; }
        public string? Usage { get; set; }
        public required int Purchase_Price { get; set; }
        public required int Selling_Price { get; set; }
        public string? Image { get; set; }
        public string? Description { get; set; }
        public required int Required_Injections { get; set; }
        public int? Time_Between_Injections { get; set; }
        public bool Status { get; set; }
        public required string Vaccine_Name { get; set; }
        public required string Vaccine_Type_Id { get; set; }

        public class CreateVaccineHandler : IRequestHandler<CreateVaccine, string>
        {
            private readonly ApplicationDbContext _context;

            public CreateVaccineHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(CreateVaccine command, CancellationToken cancellationToken)
            {
                if(_context.Vaccines.Any(v => v.Vaccine_Name == command.Vaccine_Name 
                                           && v.Vaccine_Type_Id == command.Vaccine_Type_Id
                                           && v.Origin == command.Origin) )
                {
                    return "This vaccine is existed.";
                }

                var vaccine = new Vaccine()
                {
                    Id = command.Id,
                    Vaccine_Name = command.Vaccine_Name,
                    Vaccine_Type_Id = command.Vaccine_Type_Id,
                    Number_Of_Injection = command.Number_Of_Injection,
                    Usage = command.Usage,
                    Indication = command.Indication,
                    Contraindication = command.Contraindication,
                    Time_Begin_Next_Injection = command.Time_Begin_Next_Injection,
                    Time_End_Next_Injection = command.Time_End_Next_Injection,
                    Origin = command.Origin,
                    Purchase_Price = command.Purchase_Price,
                    Selling_Price = command.Selling_Price,
                    Image = command.Image,
                    Description = command.Description,
                    Required_Injections = command.Required_Injections,
                    Time_Between_Injections = command.Time_Between_Injections,
                    Status = command.Status,
                    Vaccine_Type = _context.Vaccine_Types.FirstOrDefault(vt => vt.Id == command.Vaccine_Type_Id),
                };
                _context.Vaccines.Add(vaccine);
                await _context.SaveChangesAsync();
                return vaccine.Id;
            }
        }
    }
}
