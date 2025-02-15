using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Commands
{
    public class DistributeVaccine : IRequest<string>
    {
        public required string Vaccine_Id { get; set; }
        public required string Place_Id { get; set; }
        public required DateOnly Date_Import { get; set; }
        public int Quantity_Imported { get; set; }
        public int Quantity_Injected { get; set; }

        public class DistributeVaccineHandler : IRequestHandler<DistributeVaccine, string>
        {
            private readonly ApplicationDbContext _context;

            public DistributeVaccineHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(DistributeVaccine command, CancellationToken cancellationToken)
            {
                // Check if Vaccine exists
                var vaccine = await _context.Vaccines.FindAsync(command.Vaccine_Id);
                if (vaccine == null)
                {
                    return "Vaccine not found";
                }

                // Check if Place exists
                var place = await _context.Places.FindAsync(command.Place_Id);
                if (place == null)
                {
                    return "Place not found";
                }

                // Check for valid Quantity_Imported
                if (command.Quantity_Imported <= 0)
                {
                    return "Quantity imported must be greater than zero";
                }

                var successId = "";
                var checkDistribution = await _context.Distributions.FirstOrDefaultAsync(d => d.Vaccine_Id == command.Vaccine_Id &&
                                                                              d.Place_Id == command.Place_Id &&
                                                                              d.Date_Import == command.Date_Import,
                                                                              cancellationToken: cancellationToken);
                if (checkDistribution != null)
                {
                    var distribution = checkDistribution;
                    distribution.Quantity_Imported += command.Quantity_Imported;

                    _context.Distributions.Update(distribution);
                    successId = distribution.Id;
                }
                else
                {
                    // Generate new ID
                    var lastId = _context.Distributions.Max(x => x.Id);
                    var newId = lastId == null ? "DT000001" : $"DT{(int.Parse(lastId.Substring(2)) + 1):D6}";

                    // Create new Distribution record
                    var distribution = new Distribution
                    {
                        Id = newId,
                        Vaccine_Id = command.Vaccine_Id,
                        Place_Id = command.Place_Id,
                        Date_Import = command.Date_Import,
                        Quantity_Imported = command.Quantity_Imported,
                        Quantity_Injected = 0,
                        Vaccine = vaccine,
                        Place = place
                    };

                    _context.Distributions.Add(distribution);
                    successId = distribution.Id;
                }

                // Update vaccine quantity and save changes
                vaccine.Number_Of_Injection -= command.Quantity_Imported;
                if (vaccine.Number_Of_Injection < 0)
                {
                    return "Insufficient vaccine stock";
                }

                _context.Vaccines.Update(vaccine);
                await _context.SaveChangesAsync(cancellationToken);

                return successId;
            }
        }
    }
}
