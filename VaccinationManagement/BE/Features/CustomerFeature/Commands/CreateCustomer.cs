using Azure.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.CustomerFeature.Commands
{
    public class CreateCustomer : IRequest<string>
    {
        public required string Id { get; set; }
        public required string Address { get; set; }
        public required string Province { get; set; }
        public required string District { get; set; }
        public required string Ward { get; set; }
        public required DateOnly Date_Of_Birth { get; set; }
        public required string Full_Name { get; set; }
        public required string Email { get; set; }
        public int? Gender { get; set; }
        public required string Phone { get; set; }
        public required string Identity_Card { get; set; }
        public required string Password { get; set; }
        public required string Username { get; set; }
        public string? Image { get; set; }
        public bool Status { get; set; }

        public class CreateCustomerHandler : IRequestHandler<CreateCustomer, string>
        {
            private readonly ApplicationDbContext _context;
            private readonly TokenService _tokenService;
            private readonly IConfiguration _configuration;

            public CreateCustomerHandler(ApplicationDbContext context,
             TokenService tokenService, IConfiguration configuration)
            {
                _context = context;
                _tokenService = tokenService;
                _configuration = configuration;
            }

            public async Task<string> Handle(CreateCustomer command, CancellationToken cancellationToken)
            {
                string hashedPassword = HashPasswordService.HashPassword(command.Password);
                var jwtSettings = _configuration.GetSection("JWT");
                var refreshToken = _tokenService.GenerateRefreshToken();
                var expiryDate = DateTime.UtcNow.AddDays(int.Parse(jwtSettings["RefreshTokenValidityInDays"]!));
                var customer = new Customer()
                {
                    Id = command.Id,
                    Address = command.Address,
                    Password = hashedPassword,
                    Username = command.Username,
                    Phone = command.Phone,
                    Identity_Card = command.Identity_Card,
                    Date_Of_Birth = command.Date_Of_Birth,
                    Gender = command.Gender,
                    Email = command.Email,
                    Full_Name = command.Full_Name,
                    Status = command.Status,
                    Province = command.Province,
                    District = command.District,
                    Ward = command.Ward,
                    Image = command.Image,
                    RefreshToken = refreshToken,
                    RefreshTokenExpiryTime = expiryDate
                };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
                return customer.Id;
            }
        }
    }
}
