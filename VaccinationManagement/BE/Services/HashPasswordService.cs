using Azure.Core;

namespace VaccinationManagement.Services
{
    public static class HashPasswordService
    {
        public static string HashPassword(string password)
        {
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            return hashedPassword;
        }
    }
}
