using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models;

namespace VaccinationManagement.Features.ScheduleFeature.Queries
{
    public class GetSchedules : IRequest<IEnumerable<Injection_Schedule>>
    {
        public string? query { get; set; }
        public class GetSchedulesHandler : IRequestHandler<GetSchedules, IEnumerable<Injection_Schedule>>
        {
            private readonly ApplicationDbContext _context;
            public GetSchedulesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<Injection_Schedule>> Handle(GetSchedules request, CancellationToken cancellationToken)
            {
                var list = GetSchedules.IncludeVaccineWithoutCausingALoop(_context.Injection_Schedules);

                if (!string.IsNullOrEmpty(request.query))
                {
                    list = list.Where(sche =>
                        sche.Vaccine!.Vaccine_Name.Contains(request.query) ||
                        sche.Place!.Name.Contains(request.query)

                        );
                }

                return await list.ToListAsync(cancellationToken);
            }
        }

        public static IQueryable<Injection_Schedule> IncludeVaccineWithoutCausingALoop(DbSet<Injection_Schedule> bdset)
        {
            return bdset.Include(sche => sche.Vaccine)
                    .Select(sche => new Injection_Schedule
                    {
                        Id = sche.Id,
                        Description = sche.Description,
                        End_Date = sche.End_Date,
                        Place_Id = sche.Place_Id,
                        Place = sche.Place,
                        Start_Date = sche.Start_Date,
                        Vaccine_Id = sche.Vaccine_Id,
                        Vaccine = new Vaccine
                        {
                            Vaccine_Name = (sche.Vaccine == null) ? "null" : sche.Vaccine.Vaccine_Name,
                            Vaccine_Type_Id = sche.Vaccine!.Vaccine_Type_Id,
                            Time_Begin_Next_Injection = sche.Vaccine!.Time_Begin_Next_Injection,
                            Time_End_Next_Injection = sche.Vaccine!.Time_End_Next_Injection,
                            Number_Of_Injection = sche.Vaccine!.Number_Of_Injection,
                            Required_Injections = sche.Vaccine!.Required_Injections,

                            Contraindication = sche.Vaccine!.Contraindication,
                            Indication = sche.Vaccine!.Indication,
                            Origin = sche.Vaccine!.Origin,
                            Usage = sche.Vaccine!.Usage,
                            Purchase_Price = sche.Vaccine!.Purchase_Price,
                            Selling_Price = sche.Vaccine!.Selling_Price,
                            Image = sche.Vaccine!.Image,
                            Description = sche.Vaccine!.Description,
                            Time_Between_Injections = sche.Vaccine!.Time_Between_Injections,
                            Status = sche.Vaccine!.Status,

                            Id = sche.Vaccine_Id
                        },
                    })
                    .AsQueryable();
        }


    }
}
