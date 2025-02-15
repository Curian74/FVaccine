using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.EmployeeFeature.Commands
{
    public class CreateEmployee : IRequest<Employee>
    {
        public string? WardId { get; set; }
        public string? DistrictId { get; set; }
        public string? ProvinceId { get; set; }
        public string? Address { get; set; }
        public DateOnly? Date_Of_Birth { get; set; }
        public string? Email { get; set; }
        public int? Gender { get; set; }
        public string? Place_Id { get; set; }
        public required string Employee_Name { get; set; }
        public int Role_Id { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
        public required string Phone { get; set; }
        public IFormFile? Image { get; set; }
        public required string PositionId { get; set; }
        public bool Status { get; set; } = false;

        public class CreateEmployeeHandler : IRequestHandler<CreateEmployee, Employee>
        {
            private readonly ApplicationDbContext _context;
            private readonly IWebHostEnvironment _environment;
            private readonly IConfiguration _configuration;
            private readonly TokenService _tokenService;

            public CreateEmployeeHandler(ApplicationDbContext context, IWebHostEnvironment environment,
            IConfiguration configuration, TokenService tokenService)
            {
                _context = context;
                _environment = environment;
                _configuration = configuration;
                _tokenService = tokenService;
            }

            public async Task<Employee> Handle(CreateEmployee request, CancellationToken cancellationToken)
            {
                string hashedPassword = HashPasswordService.HashPassword(request.Password);

                var dateOfBirth = request.Date_Of_Birth ?? DateOnly.FromDateTime(DateTime.UtcNow);

                var lastestId = _context.Employees.Max(x => x.Id);
                IdFormatter idFormater = new();
                var newId = lastestId == null ? "EM000001" : idFormater.NewId(lastestId);

                string? imagePath = null;

                ImageUpload imageUpload = new ImageUpload(_environment); 

                if(request.Image != null)
                {
                    imagePath = await imageUpload.HandleImageUpload(request.Image, "employee", "images");
                }

                string formattedPhone = request.Phone.StartsWith('0') ?
                    request.Phone : "0" + request.Phone;

                var isDuplicateUsername = await _context.Employees
                    .AnyAsync(e => e.Username == request.Username)
                    || await _context.Customers
                    .AnyAsync(x => x.Username == request.Username);

                var isDuplicatePhone = await _context.Employees
                    .AnyAsync(e => e.Phone == formattedPhone)
                    || await _context.Customers
                    .AnyAsync(x => x.Phone == formattedPhone);

                var isDuplicateEmail = await _context.Employees
                    .AnyAsync(e => e.Email == request.Email)
                    || await _context.Customers
                    .AnyAsync(x => x.Email == request.Email);

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

                if (request.ConfirmPassword != request.Password)
                {
                    throw new ArgumentException("Passwords must match");
                }
                var jwtSettings = _configuration.GetSection("JWT");
                var refreshToken = _tokenService.GenerateRefreshToken();
                var expiryDate = DateTime.UtcNow.AddDays(int.Parse(jwtSettings["RefreshTokenValidityInDays"]!));

                var employee = new Employee
                {
                    Id = newId,
                    Address = request.Address,
                    Date_Of_Birth = dateOfBirth,
                    Email = request.Email,
                    Gender = request.Gender,
                    Image = imagePath ?? "",
                    PositionId = request.PositionId,
                    Employee_Name = request.Employee_Name,
                    Role_Id = request.Role_Id,
                    Phone = formattedPhone,
                    Place_Id = request.Place_Id!,
                    Password = hashedPassword,
                    Username = request.Username,
                    Status = request.Status,
                    ProvinceId = request.ProvinceId,
                    DistrictId = request.DistrictId,
                    WardId = request.WardId,
                    RefreshToken = refreshToken,
                    RefreshTokenExpiryTime = expiryDate,
                };

                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                return employee;
            }
        }

    }
}
