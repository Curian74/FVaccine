using MediatR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccineFeature.Commands
{
    public class UpdateDistributionVaccineQuantity : IRequest<string>
    {
        public string? Vaccine_Id { get; set; }
        public string? Place_Id { get; set; }
        public DateOnly? Date_Import { get; set; }
        public int Quantity_Injected { get; set; }

        public class UpdateDistributionVaccineQuantityHandler : IRequestHandler<UpdateDistributionVaccineQuantity, string>
        {
            private readonly ApplicationDbContext _context;

            public UpdateDistributionVaccineQuantityHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(UpdateDistributionVaccineQuantity command, CancellationToken cancellationToken)
            {
                // Check if Vaccine exists
                var vaccine = await _context.Vaccines.FindAsync(command.Vaccine_Id);
                if (vaccine == null)
                {
                    return "Vaccine not found.";
                }

                // Check if Place exists
                var place = await _context.Places.FindAsync(command.Place_Id);
                if (place == null)
                {
                    return "Place not found.";
                }

                // Get the Distribution
                var distribution = await _context.Distributions.FirstOrDefaultAsync(d => d.Vaccine_Id == command.Vaccine_Id &&
                                                                              d.Place_Id == command.Place_Id &&
                                                                              d.Date_Import == command.Date_Import, 
                                                                              cancellationToken: cancellationToken);
                if (distribution == null)
                {
                    return "Distribution not found.";
                }
                
                // Update Distribution record
                distribution.Quantity_Injected += command.Quantity_Injected;

                if(distribution.Quantity_Injected > distribution.Quantity_Imported)
                {
                    return "Update failed! Quantity_Injected over quantity remaining.";
                }

                _context.Distributions.Update(distribution);
                await _context.SaveChangesAsync(cancellationToken);

                return distribution.Id;
            }
        }
    }
}
