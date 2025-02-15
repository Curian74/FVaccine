using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using VaccinationManagement.Data;
using VaccinationManagement.Features.AuthFeature.Commands;
using VaccinationManagement.Features.AuthFeature.Queries;
using VaccinationManagement.Features.CustomerFeature.Queries;
using VaccinationManagement.Features.EmailFeature.Command;
using VaccinationManagement.Features.EmployeeFeature.Commands;
using VaccinationManagement.Features.EmployeeFeature.Queries;
using VaccinationManagement.Models.Configs;
using VaccinationManagement.Models.DTOs;
using VaccinationManagement.Services;

namespace VaccinationManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _context;
        private readonly SendEmailCommandHandler _sendEmailHandler;
        private readonly JwtConfig _jwtConfig;
        private readonly UserService _userService;

        public AuthController(
            IMediator mediator,
            SendEmailCommandHandler sendEmailHandler,
            ApplicationDbContext context,
			IOptions<JwtConfig> jwtConfig,
			UserService userService
        )
        {
            _mediator = mediator;
            _sendEmailHandler = sendEmailHandler;
            _context = context;
            _jwtConfig = jwtConfig.Value;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Authenticate([FromBody] LoginRequest loginDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var response = await _mediator.Send(
                    new LoginRequest { Email = loginDTO.Email, Password = loginDTO.Password }
                );
                SetTokensInsideCookie(
                    new TokenDTO
                    {
                        AccessToken = response.AccessToken,
                        RefreshToken = response.RefreshToken,
                    },
                    HttpContext
                );

                return Ok(
                    new Response { Status = ResponseStatus.SUCCESS, Data = response, Message = "Login successfully" }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(
                    new Response { Status = ResponseStatus.ERROR, Message = ex.Message }
                );
            }
        }

        [HttpGet("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refeshToken = GetTokenInsideCookie(_jwtConfig.RefreshTokenKey, HttpContext);
                var tokenDTO = await _userService.RefeshAuthTokenAsync(refeshToken);
                SetTokensInsideCookie(tokenDTO, HttpContext);
                return Ok(
                    new Response
                    {
                        Status = ResponseStatus.SUCCESS,
                        Message = "Refresh Token Successfully!",
                    }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(
                    new Response { Status = ResponseStatus.ERROR, Message = ex.Message }
                );
            }
        }

        private static string GetTokenInsideCookie(string tokenKey, HttpContext context)
        {
            context.Request.Cookies.TryGetValue(tokenKey, out var refreshToken);
            if (refreshToken is null)
                throw new Exception("Not found refresh token!");
            return refreshToken;
        }

        private void SetTokensInsideCookie(TokenDTO tokenDTO, HttpContext context)
        {
            context.Response.Cookies.Append(
                _jwtConfig.AccessTokenKey,
                tokenDTO.AccessToken,
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddMinutes(_jwtConfig.TokenValidityInMinutes),
                    HttpOnly = true,
                    IsEssential = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                }
            );
            const string refreshTokenPath = "/api/auth/refresh-token";
            context.Response.Cookies.Append(
                _jwtConfig.RefreshTokenKey,
                tokenDTO.RefreshToken,
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddDays(_jwtConfig.RefreshTokenValidityInDays),
                    HttpOnly = true,
                    IsEssential = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Path = refreshTokenPath,
                }
            );
        }

        private void RemoveTokensInsideCookie(HttpContext context)
        {
            context.Response.Cookies.Append(
                _jwtConfig.AccessTokenKey,
                "",
                new CookieOptions { HttpOnly = false, Expires = DateTimeOffset.UtcNow.AddDays(-1) }
            );
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            var customer = await _mediator.Send(new GetCustomerByEmail { Email = email });
            var password = GenerateRandomPassword();
            var Username = "";
            if (customer != null)
            {
                await _mediator.Send(
                    new ChangePasswordSendMail
                    {
                        Id = customer.Id,
                        NewPassWord = password,
                        IsEmployee = false,
                    }
                );
                Username = customer.Full_Name;
            }
            else
            {
                var account = await _mediator.Send(new GetEmployeeByEmail { Email = email });
                if (account == null)
                    return BadRequest(
                        new Response
                        {
                            Status = ResponseStatus.ERROR,
                            Message = "We cannot find your email",
                        }
                    );
                await _mediator.Send(
                    new ChangePasswordSendMail
                    {
                        Id = account.Id,
                        NewPassWord = password,
                        IsEmployee = true,
                    }
                );
                Username = account.Username;
            }
            var emailContent =
                $@"
        <p>Hi {Username},</p>
        <p>Forgot your password?</p>
        <p>We received a request to reset the password for your account.</p>
        <p>Please login with your new password and change it.</p>
        <p>Reset Password: {password}</a></p>";
            var command = new SendEmailCommand
            {
                ToEmail = email,
                Subject = "Reset Password",
                Body = emailContent,
            };
            var result = await _sendEmailHandler.Handle(command);
            if (result)
            {
                return Ok("Email sent successfully.");
            }
            else
            {
                return BadRequest("Failed to send email.");
            }
        }

        public static string GenerateRandomPassword()
        {
            string ValidCharacters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
            Random random = new Random();
            return new string(
                Enumerable
                    .Repeat(ValidCharacters, 12)
                    .Select(s => s[random.Next(s.Length)])
                    .ToArray()
            );
        }

        [HttpGet("profile")]
		public async Task<IActionResult> GetProfile([FromQuery] string email)
		{
			var account = await _mediator.Send(new GetAccountByEmail { Email = email });
			if (account == null) return BadRequest(new Response
			{
				Status = ResponseStatus.ERROR,
				Message = "We cannot find your email"
			});
			return Ok(account);
		}

    }
}
