using MediatR;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Features.EmployeeFeature.Commands
{
    public class ImportEmployee : IRequest<string>
    {
        public IFormFile File { get; set; } = null!; // Expecting a file upload

        public class ImportVaccinesHandler : IRequestHandler<ImportEmployee, string>
        {
            private readonly ApplicationDbContext _context;

            public ImportVaccinesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(ImportEmployee command, CancellationToken cancellationToken)
            {
                if (command.File == null || command.File.Length == 0)
                {
                    throw new ArgumentException("No file uploaded");
                }

                var fileExtension = Path.GetExtension(command.File.FileName).ToLowerInvariant();
                if (fileExtension != ".xls" && fileExtension != ".xlsx")
                {
                    throw new ArgumentException("Please choose an excel file to import.");
                }

                var expectedHeaders = new List<string>()
                    {
                        "Username", "Employee_Name", "Date_Of_Birth", "Phone", "Password", "Email",
                        "WardId", "DistrictId", "ProvinceId", "Address", "Working_Place",
                        "PositionId", "Gender", "Role_Id", "Status"
                    };

                List<Employee> employees = new List<Employee>();

                using (var stream = new MemoryStream())
                {
                    await command.File.CopyToAsync(stream);

                    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets[0]; // Assuming the first worksheet
                        int rowCount = worksheet.Dimension.Rows;
                        int colCount = worksheet.Dimension.Columns;

                        //Check if the file has the expected number of columns
                        if (colCount != expectedHeaders.Count)
                        {
                            throw new ArgumentException("Please choose an Excel file with the correct format of Employee.");
                        }

                        // Retrieve and check headers in the first column
                        for (int col = 1; col <= colCount; col++)
                        {
                            var header = worksheet.Cells[1, col].Value?.ToString()?.Trim();
                            if (header != expectedHeaders[col - 1])
                            {
                                throw new ArgumentException("Please choose an Excel file with the correct format of Employee.");
                            }
                        }

                        // Get the latest ID only once at the beginning
                        var lastestId = _context.Employees.Max(x => x.Id);
                        int numericPart = lastestId != null ? int.Parse(lastestId.Substring(2)) : 0;

                        for (int row = 2; row <= rowCount; row++) // Assuming row 1 is header
                        {
                            // Generate a new unique ID for each employee
                            numericPart++;
                            var newId = $"EM{numericPart:D6}";

                            var formattedPhone = worksheet.Cells[row, 4].Value.ToString()!
                                .StartsWith("0") ? worksheet.Cells[row, 4].Value?.ToString()
                                : "0" + worksheet.Cells[row, 4].Value?.ToString();

                            var email = worksheet.Cells[row, 6].Value?.ToString();
                            var username = worksheet.Cells[row, 1].Value?.ToString()!;

                            var isDuplicated = await _context.Customers
                            .AnyAsync(x => x.Email == email || x.Phone == formattedPhone || x.Username == username)
                            || await _context.Employees
                            .AnyAsync(x => x.Email == email || x.Phone == formattedPhone || x.Username == username);

                            if (isDuplicated)
                            {
                                throw new ArgumentException("Error! Email, phone number or username already existed. Double check the data and try again.");
                            }

                            var employee = new Employee
                            {
                                Id = newId,
                                Username = username,
                                Employee_Name = worksheet.Cells[row, 2].Value?.ToString()!,
                                Date_Of_Birth = DateTime.TryParse(worksheet.Cells[row, 3].Value?.ToString(), out var dtDob)
                                                ? DateOnly.FromDateTime(dtDob)
                                                : (DateOnly?)null,
                                Phone = formattedPhone,
                                Password = HashPasswordService.HashPassword(worksheet.Cells[row, 5].Value?.ToString()!),
                                Email = email,
                                WardId = worksheet.Cells[row, 7].Value?.ToString(),
                                DistrictId = worksheet.Cells[row, 8].Value?.ToString(),
                                ProvinceId = worksheet.Cells[row, 9].Value?.ToString(),
                                Address = worksheet.Cells[row, 10].Value?.ToString(),
                                Place_Id = worksheet.Cells[row, 11].Value?.ToString()!,
                                PositionId = worksheet.Cells[row, 12].Value?.ToString()!,
                                Gender = int.TryParse(worksheet.Cells[row, 13].Value?.ToString(), out int gender) ? gender : 0,
                                Role_Id = int.Parse(worksheet.Cells[row, 14].Value?.ToString()!),
                                Status = worksheet.Cells[row, 15].Value?.ToString() == "1",
                            };

                            employees.Add(employee);
                        }
                    }
                }

                _context.Employees.AddRange(employees);
                await _context.SaveChangesAsync();

                return $"{employees.Count} employees were successfully imported.";
            }
        }
    }
}
