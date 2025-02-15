using MediatR;
using VaccinationManagement.Data;
using VaccinationManagement.Models;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;

namespace VaccinationManagement.Features.VaccineFeature.Commands
{
    public class ImportVaccines : IRequest<string>
    {
        public IFormFile File { get; set; } = null!; // Expecting a file upload

        public class ImportVaccinesHandler : IRequestHandler<ImportVaccines, string>
        {
            private readonly ApplicationDbContext _context;

            public ImportVaccinesHandler(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<string> Handle(ImportVaccines command, CancellationToken cancellationToken)
            {
                if (command.File == null || command.File.Length == 0)
                {
                    throw new ArgumentException("No file uploaded");
                }

                try
                {
                    // Define the expected headers in order
                    var expectedHeaders = new List<string>
        {
            "Vaccine_Name", "Vaccine_Type_Id", "Number_Of_Injection", "Origin",
            "Contraindication", "Indication", "Time_Begin_Next_Injection",
            "Time_End_Next_Injection", "Usage", "Status", "Purchase_Price", "Selling_Price", 
            "Image", "Description", "Required_Injections", "Time_Between_Injections"
        };

                    List<Vaccine> vaccines = new List<Vaccine>();

                    using (var stream = new MemoryStream())
                    {
                        await command.File.CopyToAsync(stream);

                        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                        using (var package = new ExcelPackage(stream))
                        {
                            var worksheet = package.Workbook.Worksheets[0]; // Assuming the first worksheet
                            int rowCount = worksheet.Dimension.Rows;
                            int colCount = worksheet.Dimension.Columns;

                            // Check if the file has the expected number of columns
                            if (colCount != expectedHeaders.Count)
                            {
                                throw new Exception("Incorrect format.");
                                //throw new Exception("The uploaded file format is incorrect: column count mismatch.");
                            }

                            // Retrieve and check headers in the first row
                            for (int col = 1; col <= colCount; col++)
                            {
                                var header = worksheet.Cells[1, col].Value?.ToString()?.Trim();
                                if (header != expectedHeaders[col - 1])
                                {
                                    throw new Exception("Incorrect format.");
                                    //throw new Exception($"The uploaded file format is incorrect: expected header '{expectedHeaders[col - 1]}' but found '{header}' at column {col}.");
                                }
                            }

                            var newId = "";
                            var lastestId = _context.Vaccines.Max(x => x.Id)!;
                            
                            for (int row = 2; row <= rowCount; row++) // Assuming row 1 is header
                            {
                                if (lastestId == null)
                                {
                                    newId = "VC000001";
                                }
                                else
                                {
                                    var numericPart = int.Parse(lastestId.Substring(2));
                                    newId = $"VC{(numericPart + 1):D6}"; // Format to 6 digits
                                }
                                lastestId = newId;
                                string row7 = worksheet.Cells[row, 7].Value?.ToString() ?? "";
                                string row8 = worksheet.Cells[row, 8].Value?.ToString() ?? "";
                                var vaccine = new Vaccine
                                {
                                    Id = newId,
                                    Vaccine_Name = worksheet.Cells[row, 1].Value?.ToString(),
                                    Vaccine_Type_Id = worksheet.Cells[row, 2].Value?.ToString(),
                                    Number_Of_Injection = int.TryParse(worksheet.Cells[row, 3].Value?.ToString(), out int result) ? result : (int?)null,
                                    Origin = worksheet.Cells[row, 4].Value?.ToString(),
                                    Contraindication = worksheet.Cells[row, 5].Value?.ToString(),
                                    Indication = worksheet.Cells[row, 6].Value?.ToString(),
                                    Time_Begin_Next_Injection = DateOnly.TryParse(row7[..row7.IndexOf(' ')], out var timeBegin) ? timeBegin : (DateOnly?)null,
                                    Time_End_Next_Injection = DateOnly.TryParse(row8[..row8.IndexOf(' ')], out var timeEnd) ? timeEnd : (DateOnly?)null,
                                    Usage = worksheet.Cells[row, 9].Value?.ToString(),
                                    Status = worksheet.Cells[row, 10].Value?.ToString() == "Active",
                                    Purchase_Price = int.TryParse(worksheet.Cells[row, 11].Value?.ToString(), out int result2) ? result2 : 0,
                                    Selling_Price = int.TryParse(worksheet.Cells[row, 12].Value?.ToString(), out int result3) ? result3 : 0,
                                    Image = worksheet.Cells[row, 13].Value?.ToString(),
                                    Description = worksheet.Cells[row, 14].Value?.ToString(),
                                    Required_Injections = int.TryParse(worksheet.Cells[row, 15].Value?.ToString(), out int ri) ? ri : 0,
                                    Time_Between_Injections = int.TryParse(worksheet.Cells[row, 16].Value?.ToString(), out int tbi) ? tbi : (int?)null,
                                };

                                if (_context.Vaccines.Any(v => v.Vaccine_Name == vaccine.Vaccine_Name
                                           && v.Vaccine_Type_Id == vaccine.Vaccine_Type_Id
                                           && v.Origin == vaccine.Origin))
                                {
                                    return "This vaccine is existed.";
                                }

                                vaccines.Add(vaccine);
                            }
                        }
                    }

                    _context.Vaccines.AddRange(vaccines);
                    await _context.SaveChangesAsync();

                    return $"{vaccines.Count} vaccines were successfully imported.";
                }
                catch (Exception ex)
                {
                    throw new Exception($"Error importing vaccines: {ex.Message}");
                }
            }
        }
    }
}
