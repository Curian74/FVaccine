using Azure.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VaccinationManagement.Data;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.AuthFeature.Queries
{
	public class LoginResponse
	{
		public string? Username { get; set; }
		public string? Email { get; set; }
		public string? AccessToken { get; set; }
		public string? RefreshToken { get; set; }
		public int AccessTokenExpiresInMinutes { get; set; }
		public int RefreshTokenExpiresInDays { get; set; }
	}

	public class LoginRequest : IRequest<LoginResponse>
	{
		public required string Email { get; set; }
		public required string Password { get; set; }
	}

	public class LoginHandler : IRequestHandler<LoginRequest, LoginResponse>
	{
		private readonly ApplicationDbContext _context;
		private readonly IConfiguration _configuration;
		private readonly TokenService _tokenService;

		public LoginHandler(ApplicationDbContext context, IConfiguration configuration, TokenService tokenService)
		{
			_context = context;
			_configuration = configuration;
			_tokenService = tokenService;
		}

		public async Task<LoginResponse> Handle(LoginRequest request, CancellationToken cancellationToken)
		{
			var (isValid, userName, accountType) = await IsValidUser(request.Email, request.Password);
			if (isValid)
			{
				var jwtSettings = _configuration.GetSection("JWT");
				var accessToken = GenerateJWTToken(request.Email, jwtSettings);
				var refreshToken = _tokenService.GenerateRefreshToken();

				if (accountType == "Employee")
				{
					var employee = await _context.Employees.FirstOrDefaultAsync(c => c.Email == request.Email);
					employee.RefreshToken = refreshToken;
					employee.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(int.Parse(jwtSettings["RefreshTokenValidityInDays"]!));
					await _context.SaveChangesAsync();
				}
				else if (accountType == "Customer")
				{
					var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == request.Email);
					customer.RefreshToken = refreshToken;
					customer.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(int.Parse(jwtSettings["RefreshTokenValidityInDays"]!));
					await _context.SaveChangesAsync();
				}

				return new LoginResponse
				{
					Username = userName,
					Email = request.Email,
					AccessToken = accessToken,
					RefreshToken = refreshToken,
					AccessTokenExpiresInMinutes = int.Parse(jwtSettings["TokenValidityInMinutes"]!),
					RefreshTokenExpiresInDays = int.Parse(jwtSettings["RefreshTokenValidityInDays"]!),
				};
			}
			throw new UnauthorizedAccessException("Email or password incorrect!");
		}


		private string GenerateJWTToken(string email, IConfigurationSection jwtSettings)
		{
			var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SigningKey"]!));
			var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
			var claims = new[]
			{
				new Claim(JwtRegisteredClaimNames.Sub, email),
				new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
				new Claim(ClaimTypes.Email, email),
			};

			var token = new JwtSecurityToken(
				issuer: jwtSettings["Issuer"],
				audience: jwtSettings["Audience"],
				claims: claims,
				expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["TokenValidityInMinutes"]!)),
				signingCredentials: creds
			);
			return new JwtSecurityTokenHandler().WriteToken(token);
		}


		private async Task<(bool IsValid, string Username, string AccountType)> IsValidUser(string email, string password)
		{
			// Kiểm tra Employee
			var employee = await _context.Employees.FirstOrDefaultAsync(c => c.Email == email);
			if (employee != null)
			{
				if (employee.Status == false)
				{
					throw new UnauthorizedAccessException("Account is inactive.");
				}

				var isCurrentPassValid = BCrypt.Net.BCrypt.Verify(password, employee.Password);
				return (isCurrentPassValid, employee.Username, "Employee");
			}

			// Kiểm tra Customer
			var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
			if (customer != null)
			{
				if (customer.Status == false)
				{
					throw new UnauthorizedAccessException("Account is inactive.");
				}

				var isCurrentPassValid = BCrypt.Net.BCrypt.Verify(password, customer.Password);
				return (isCurrentPassValid, customer.Full_Name, "Customer");
			}

			// Không tìm thấy tài khoản
			return (false, string.Empty, string.Empty);
		}

	}
}
