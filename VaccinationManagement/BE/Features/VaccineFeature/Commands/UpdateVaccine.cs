using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Commands
{
    public class UpdateVaccine : IRequest<string>
    {
        public required string Id { get; set; }
        public string? Contraindication { get; set; }
        public string? Indication { get; set; }
        public int? Number_Of_Injection { get; set; }
        public string? Origin { get; set; }
        public DateOnly? Time_Begin_Next_Injection { get; set; }
        public DateOnly? Time_End_Next_Injection { get; set; }
        public string? Usage { get; set; }
        public string Vaccine_Name { get; set; } = null!;
        public required int Purchase_Price { get; set; }
        public required int Selling_Price { get; set; }
        public string? Image { get; set; }
        public string? Description { get; set; }
        public required int Required_Injections { get; set; }
        public int? Time_Between_Injections { get; set; }
        public bool Status { get; set; }
        public string Vaccine_Type_Id { get; set; } = null!;

        public class UpdateVaccineHandler : IRequestHandler<UpdateVaccine, string>
        {
            private readonly ApplicationDbContext _context;

            public UpdateVaccineHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(UpdateVaccine command, CancellationToken cancellationToken)
            {
                var vaccine = await _context.Vaccines
                    .FirstOrDefaultAsync(v => v.Id == command.Id, cancellationToken);

                if (vaccine == null)
                {
                    throw new Exception($"Vaccine with Id {command.Id} not found.");
                }

                var checkVaccine = _context.Vaccines.FirstOrDefault(v => v.Vaccine_Name == command.Vaccine_Name
                                           && v.Vaccine_Type_Id == command.Vaccine_Type_Id
                                           && v.Origin == command.Origin);
                if (checkVaccine != null && vaccine.Id != checkVaccine.Id)
                {
                    return "This vaccine is existed.";
                }

                vaccine.Contraindication = command.Contraindication;
                vaccine.Indication = command.Indication;
                vaccine.Number_Of_Injection = command.Number_Of_Injection;
                vaccine.Origin = command.Origin;
                vaccine.Time_Begin_Next_Injection = command.Time_Begin_Next_Injection;
                vaccine.Time_End_Next_Injection = command.Time_End_Next_Injection;
                vaccine.Usage = command.Usage;
                vaccine.Vaccine_Name = command.Vaccine_Name;
                vaccine.Purchase_Price = command.Purchase_Price;
                vaccine.Selling_Price = command.Selling_Price;
                vaccine.Status = command.Status;
                vaccine.Vaccine_Type_Id = command.Vaccine_Type_Id;
                vaccine.Image = command.Image;
                vaccine.Description = command.Description;
                vaccine.Time_Between_Injections = command.Time_Between_Injections;
                vaccine.Required_Injections = command.Required_Injections;

                _context.Vaccines.Update(vaccine);
                await _context.SaveChangesAsync(cancellationToken);

                return command.Id;
            }
        }
    }
}
