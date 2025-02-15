using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Models;

namespace VaccinationManagement.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> opt) : base(opt)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Vaccine>()
                .ToTable(tb => tb.HasTrigger("trg_UpdateVaccineStatus"));
            modelBuilder.Entity<Injection_Schedule>()
            .HasOne(i => i.Vaccine)
            .WithMany(v => v.Injection_Schedules)
            .HasForeignKey(i => i.Vaccine_Id)
            .IsRequired();

            modelBuilder.Entity<MenuRoleAuthorization>()
              .HasKey(auth => new { auth.MenuId, auth.RoleId });

            modelBuilder.Entity<MenuRoleAuthorization>() 
              .HasOne(mra => mra.Menu) 
              .WithMany(ma => ma.MenuRoleAuthorizations) 
              .HasForeignKey(mra => mra.MenuId); 
        }


        public DbSet<Employee> Employees { get; set; }
        public DbSet<Customer> Customers { get; set; }

        public DbSet<Injection_Result> Injection_Results { get; set; }

        public DbSet<Injection_Schedule> Injection_Schedules { get; set; }

        public DbSet<News> News { get; set; }

        public DbSet<News_Type> News_Types { get; set; }

        public DbSet<Vaccine> Vaccines { get; set; }

        public DbSet<Vaccine_Type> Vaccine_Types { get; set; }

        public DbSet<Menu> Menus { get; set; }

        public DbSet<EmployeePosition> EmployeePositions { get; set; }

        public DbSet<Place> Places { get; set; }

        public DbSet<Distribution> Distributions { get; set; }

        public DbSet<NewsImages> NewsImages { get; set; }

        public DbSet<UserRole> Roles { get; set; }

        public DbSet<MenuRoleAuthorization> MenuRoleAuthorizations { get; set; }
    }
}
