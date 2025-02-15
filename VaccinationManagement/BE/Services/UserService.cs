using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VaccinationManagement.Data;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Services
{
    public class UserService
    {
        private readonly ApplicationDbContext _context;
		private readonly TokenService _tokenService;
        public UserService(ApplicationDbContext context, TokenService tokenService) {
            _context = context;
			_tokenService = tokenService;
        }
		public async Task<TokenDTO> RefeshAuthTokenAsync(string refreshToken)
		{
			var customer = await _context.Customers.FirstOrDefaultAsync(c => c.RefreshToken == refreshToken);
			if (customer != null)
			{
				if (customer.RefreshTokenExpiryTime <= DateTime.Now)
					throw new Exception("Refresh token expired");

				return await CreateAuthTokenAsync(customer.Full_Name, customer.Email, "Customer");
			}

			var employee = await _context.Employees.FirstOrDefaultAsync(e => e.RefreshToken == refreshToken);
			if (employee != null)
			{
				if (employee.RefreshTokenExpiryTime <= DateTime.Now)
					throw new Exception("Refresh token expired");

				return await CreateAuthTokenAsync(employee.Employee_Name, employee.Email, "Employee");
			}

			throw new Exception("Invalid refresh token");
		}


		private async Task<TokenDTO> CreateAuthTokenAsync(string userName, string email, string role, int expDays = -1)
		{
			var refreshToken = _tokenService.GenerateRefreshToken();
			var expiryTime = expDays > 0 ? DateTime.Now.AddDays(expDays) : DateTime.Now.AddDays(7); 

			if (role == "Customer")
			{
				var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
				if (customer != null)
				{
					customer.RefreshToken = refreshToken;
					customer.RefreshTokenExpiryTime = expiryTime;
				}
			}
			else if (role == "Employee")
			{
				var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
				if (employee != null)
				{
					employee.RefreshToken = refreshToken;
					employee.RefreshTokenExpiryTime = expiryTime;
				}
			}

			await _context.SaveChangesAsync();

			var claims = new List<Claim>
	{
		new(ClaimTypes.Name, userName),
		new(ClaimTypes.Email, email),
		new(ClaimTypes.Role, role)
	};
			return new TokenDTO
			{
				AccessToken = _tokenService.GenerateAccessToken(claims),
				RefreshToken = refreshToken
			};
		}

	}
}
