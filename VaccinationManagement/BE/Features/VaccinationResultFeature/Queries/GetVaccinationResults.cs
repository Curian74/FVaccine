using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.VaccinationResultFeature.Queries
{
    public class GetVaccinationResults : IRequest<IEnumerable<Injection_Result>>
    {
        public string? query { get; set; }
        public class GetVaccinationResultHandler : IRequestHandler<GetVaccinationResults, IEnumerable<Injection_Result>>
        {
            private readonly ApplicationDbContext _context;
            public GetVaccinationResultHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Injection_Result>> Handle(GetVaccinationResults request, CancellationToken cancellationToken)
            {
                var list = GetVaccinationResults.IncludeVaccineWithoutCausingALoop(_context.Injection_Results);

                if (!string.IsNullOrEmpty(request.query))
                {
                    list = list.Where(vr =>
                        vr.Customer!.Full_Name.Contains(request.query) ||
                        vr.Vaccine!.Vaccine_Name.Contains(request.query)

                        );
                }

                return await list.ToListAsync(cancellationToken);
            }
        }

        public static IQueryable<Injection_Result> IncludeVaccineWithoutCausingALoop(DbSet<Injection_Result> bdset)
        {
            return bdset.Include(vr => vr.Customer)
                    .Select(vr => new Injection_Result
                    {
                        Id = vr.Id,
                        Customer_Id = vr.Customer_Id,
                        Injection_Date = vr.Injection_Date,
                        Injection_Place_Id = vr.Injection_Place_Id,
                        Injection_Place = vr.Injection_Place,
                        Next_Injection_Date = vr.Next_Injection_Date,
                        Number_Of_Injection = vr.Number_Of_Injection,
                        Injection_Number = vr.Injection_Number,
                        Prevention = vr.Prevention,
                        Vaccine_Id = vr.Vaccine_Id,
                        Customer = SterilizeCustomerData(vr.Customer!),
                        IsVaccinated = vr.IsVaccinated,
                        Vaccine = new Vaccine
                        {
                            Vaccine_Name = (vr.Vaccine == null) ? "null" : vr.Vaccine.Vaccine_Name,
                            Vaccine_Type_Id = vr.Vaccine!.Vaccine_Type_Id,
                            Time_Begin_Next_Injection = vr.Vaccine!.Time_Begin_Next_Injection,
                            Time_End_Next_Injection = vr.Vaccine!.Time_End_Next_Injection,
                            Number_Of_Injection = vr.Vaccine!.Number_Of_Injection,
                            Required_Injections = vr.Vaccine!.Required_Injections,

                            Contraindication = vr.Vaccine!.Contraindication,
                            Indication = vr.Vaccine!.Indication,
                            Origin = vr.Vaccine!.Origin,
                            Usage = vr.Vaccine!.Usage,
                            Purchase_Price = vr.Vaccine!.Purchase_Price,
                            Selling_Price = vr.Vaccine!.Selling_Price,
                            Image = vr.Vaccine!.Image,
                            Description = vr.Vaccine!.Description,
                            Time_Between_Injections = vr.Vaccine!.Time_Between_Injections,
                            Status = vr.Vaccine!.Status,

                            Id = vr.Vaccine_Id
                        },
                    })
                    .AsQueryable();
            // Alat to exclude Injection_Result.Vaccine.Injection_Results smh
        }

        public static Customer SterilizeCustomerData(Customer customer) {
          customer.Password = "";
          customer.EmailChangeToken = "";
          customer.EmailChangeTokenExpiry = null;
          return customer;
        }

    }
}
