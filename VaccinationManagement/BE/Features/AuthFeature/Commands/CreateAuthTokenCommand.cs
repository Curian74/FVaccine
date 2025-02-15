using System.Security.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Models.DTOs;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.AuthFeature.Commands;

public class CreateAuthTokenCommand : IRequest<TokenDTO>
{
    public string UserId { get; }
    public int ExpDays { get; }

    public CreateAuthTokenCommand(string userId, int expDays = -1)
    {
        UserId = userId;
        ExpDays = expDays;
    }
}

public class CreateAuthTokenCommandHandler : IRequestHandler<CreateAuthTokenCommand, TokenDTO>
{
    private readonly ApplicationDbContext _context;
    private readonly TokenService _tokenService;

    public CreateAuthTokenCommandHandler(ApplicationDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<TokenDTO> Handle(
        CreateAuthTokenCommand request,
        CancellationToken cancellationToken
    )
    {
        // Lấy thông tin người dùng từ DB
        var user = await _context.Customers.FirstOrDefaultAsync(
            u => u.Id == request.UserId,
            cancellationToken
        );

        if (user == null)
            throw new Exception("User not found");

        // Tạo Refresh Token
        user.RefreshToken = _tokenService.GenerateRefreshToken();
        if (request.ExpDays > 0)
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(request.ExpDays);

        // Cập nhật thông tin người dùng
        _context.Customers.Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        // Tạo danh sách claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Full_Name ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
        };

        // Thêm roles vào claims
        //claims.Add(new Claim(ClaimTypes.Role, user.Role_Id));

        // Tạo TokenDTO
        return new TokenDTO
        {
            AccessToken = _tokenService.GenerateAccessToken(claims),
            RefreshToken = user.RefreshToken,
        };
    }
}
