using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using VaccinationManagement.Models.Configs;

namespace VaccinationManagement.Services
{
    public class TokenService
    {
        private readonly JwtConfig _jwtConfig;
        private readonly SymmetricSecurityKey _key;

        public TokenService(IOptions<JwtConfig> jwtConfig)
        {
            _jwtConfig = jwtConfig.Value;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.SigningKey));
        }

        public string GenerateAccessToken(List<Claim> claims)
        {
            var credentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new(claims),
                Expires = DateTime.Now.AddMinutes(_jwtConfig.TokenValidityInMinutes),
                SigningCredentials = credentials,
                Issuer = _jwtConfig.Issuer,
                Audience = _jwtConfig.Audience,
            };
            var tokenHandle = new JwtSecurityTokenHandler();
            var token = tokenHandle.CreateToken(tokenDescriptor);
            return tokenHandle.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
