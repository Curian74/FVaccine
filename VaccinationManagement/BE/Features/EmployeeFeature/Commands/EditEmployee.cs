using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.EmployeeFeature.Commands
{
    public class EditEmployee : IRequest<Employee>
    {
        public string? Id { get; set; }
        public string? WardId { get; set; }
        public string? DistrictId { get; set; }
        public string? ProvinceId { get; set; }
        public required string Address { get; set; }
        public DateOnly? Date_Of_Birth { get; set; }
        public required string Email { get; set; }
        public int? Gender { get; set; }
        public required string PositionId { get; set; }
        public string? Place_Id { get; set; }
        public required string Employee_Name { get; set; }
        public int Role_Id { get; set; }
        public required string Username { get; set; }
        public required string Phone { get; set; }
        public IFormFile? Image { get; set; }
        public bool Status { get; set; }

        public class EditEmployeeHandler : IRequestHandler<EditEmployee, Employee>
        {
            private readonly ApplicationDbContext _context;
            private readonly IWebHostEnvironment _environment;

            public EditEmployeeHandler(ApplicationDbContext context, IWebHostEnvironment environment)
            {
                _context = context;
                _environment = environment;
            }

            public async Task<Employee> Handle(EditEmployee request, CancellationToken cancellationToken)
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == request.Id);
                if (employee == null)
                {
                    throw new KeyNotFoundException("Employee not found");
                }

                string? imagePath = null;

                ImageUpload imageUpload = new ImageUpload(_environment);

                if (request.Image != null)
                {
                    imagePath = await imageUpload.HandleImageUpload(request.Image, "employee", "images");
                }

                string formattedPhone = request.Phone.StartsWith('0') ?
                    request.Phone : "0" + request.Phone;

                var isDuplicateUsername = await _context.Employees
                    .AnyAsync(e => e.Username == request.Username && e.Id != employee.Id)
                    || await _context.Customers
                    .AnyAsync(x => x.Username == request.Username && x.Id != employee.Id);

                var isDuplicatePhone = await _context.Employees
                    .AnyAsync(e => e.Phone == formattedPhone && e.Id != employee.Id)
                    || await _context.Customers
                    .AnyAsync(x => x.Phone == formattedPhone && x.Id != employee.Id);

                var isDuplicateEmail = await _context.Employees
                    .AnyAsync(e => e.Email == request.Email && e.Id != employee.Id)
                    || await _context.Customers
                    .AnyAsync(x => x.Email == request.Email && x.Id != employee.Id);

                if (isDuplicateUsername)
                {
                    throw new DuplicateNameException("Username already existed");
                }

                if (isDuplicatePhone)
                {
                    throw new DuplicateNameException("This phone number is already registered");
                }

                if (isDuplicateEmail)
                {
                    throw new DuplicateNameException("This email is already registered");
                }

                employee.PositionId = request.PositionId;
                employee.Email = request.Email ?? employee.Email;
                employee.Gender = request.Gender ?? employee.Gender;
                employee.Image = imagePath ?? employee.Image;
                employee.Username = request.Username ?? employee.Username;
                employee.Role_Id = request.Role_Id;
                employee.Phone = formattedPhone ?? employee.Phone;
                employee.Date_Of_Birth = request.Date_Of_Birth ?? employee.Date_Of_Birth;
                employee.Place_Id = request.Place_Id!;
                employee.Address = request.Address ?? employee.Address;
                employee.Employee_Name = request.Employee_Name ?? employee.Employee_Name;
                employee.Status = request.Status;
                employee.ProvinceId = request.ProvinceId!;
                employee.DistrictId = request.DistrictId!;
                employee.WardId = request.WardId!;

                await _context.SaveChangesAsync();
                return employee;
            }
        }
    }
}
