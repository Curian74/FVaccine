using VaccinationManagement.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Text;
using VaccinationManagement.Data;
using VaccinationManagement.Features.EmailFeature.Command;
using VaccinationManagement.Models.Configs;
using VaccinationManagement.Services;

namespace VaccinationManagement
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
			builder.Services.AddScoped<TokenService>();
			builder.Services.AddScoped<UserService>();
			var jwtSection = builder.Configuration.GetSection("JWT");
			var jwtConfig = jwtSection.Get<JwtConfig>()
	?? throw new Exception("Jwt options have not been set!");
			builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection("JWT"));

			builder.Services.AddDbContext<ApplicationDbContext>(opt =>
            {
                opt.UseSqlServer(builder.Configuration.GetConnectionString("DbConnection"));
            });

            builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            var _policyName = "CQRSPolicy";

            builder.Services.AddCors(opt =>
            {
                opt.AddPolicy(name: _policyName,
                policy =>
                {
                    policy.WithOrigins
                        ("http://localhost:3000")
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
            });

            //JWT Authentication Configuration

            var signingKey = Encoding.UTF8.GetBytes(jwtConfig.SigningKey!);
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtConfig.Issuer,
                    ValidAudience = jwtConfig.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(signingKey),
                    ClockSkew = TimeSpan.Zero
                };

            });
			builder.Services.Configure<EmailConfig>(builder.Configuration.GetSection("EmailApiKey"));
			builder.Services.AddTransient<SendEmailCommandHandler>();
			var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseRouting();

            app.UseHttpsRedirection();

            app.UseCors(_policyName);

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseStaticFiles();    

			app.MapControllers();

            app.Run();
        }
    }
}
