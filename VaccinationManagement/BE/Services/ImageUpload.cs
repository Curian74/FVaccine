using Azure.Core;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;

namespace VaccinationManagement.Services
{
    public class ImageUpload
    {
        private readonly IWebHostEnvironment _environment;


        public ImageUpload(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        //Must create wwwroot folder first
        public async Task<string> HandleImageUpload(IFormFile img, string target, string path)
        {
            string imagePath = null!;
            if (img != null)
            {    
                string wwwRootFolder = _environment.WebRootPath;
                if (!Directory.Exists(wwwRootFolder))
                {
                    Directory.CreateDirectory(wwwRootFolder); 
                }

                //Store the image inside Uploads/target/path
                //Example: Uploads/employee/images
                string folder = Path.Combine(_environment.WebRootPath, $"Uploads/{target}/{path}");
                Directory.CreateDirectory(folder);
                string fileName = Guid.NewGuid().ToString() + "_" + img.FileName;
                string filePath = Path.Combine(folder, fileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await img.CopyToAsync(fileStream);
                }

                imagePath = $"/Uploads/{target}/{path}/{fileName}"; // Storing the relative path to the image
            }

            return imagePath ?? "";
        }

        public bool IsImageFile(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            return allowedExtensions.Contains(extension);
        }
    }
}
