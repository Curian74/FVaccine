using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using VaccinationManagement.Data;
using VaccinationManagement.Features.NewsImageFeature.Commands;
using VaccinationManagement.Features.NewsImageFeature.Queries;
using VaccinationManagement.Models;
using VaccinationManagement.Services;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsImageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _environment;

        public NewsImageController(ApplicationDbContext context, IMediator mediator,
            IWebHostEnvironment environment)
        {
            _context = context;
            _mediator = mediator;
            _environment = environment;
        }

        [HttpPost("{newsId}")]
        public async Task<IActionResult> UploadNewsImages(string newsId, [FromForm] IFormFileCollection files)
        {
            try
            {
                ImageUpload imageUpload = new(_environment);
                if (files == null || !files.Any())
                {
                    return BadRequest("No files were uploaded.");
                }

                // Verify news exists
                var news = await _context.News.FirstOrDefaultAsync(x => x.Id == newsId);
                if (news == null)
                {
                    return NotFound($"News with ID {newsId} not found.");
                }

                var uploadedImages = new List<NewsImages>();
                foreach (var file in files)
                {
                    if (!imageUpload.IsImageFile(file))
                    {
                        return BadRequest($"File {file.FileName} is not a valid image.");
                    }

                    var filePath = await imageUpload.HandleImageUpload(file, "news", "images");
                    var newsImage = new NewsImages
                    {
                        Id = Guid.NewGuid().ToString(),
                        ImagePath = filePath,
                        NewsId = newsId
                    };
                    uploadedImages.Add(newsImage);
                }

                await _context.NewsImages.AddRangeAsync(uploadedImages);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Images uploaded successfully",
                    images = uploadedImages.Select(img => new { img.Id, img.ImagePath })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetImagesByNewsId([FromQuery] [Required]string newsId)
        {
            return Ok(await _mediator.Send(new GetNewsImagesByNewsId { NewsId = newsId }));
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteImages([FromBody] DeleteNewsImage command)
        {
            try
            {
                var deletedImages = await _mediator.Send(command);
                return NoContent();
            }

            catch(KeyNotFoundException ex)
            {
                return BadRequest(new {message = ex.Message});
            }

            catch(Exception ex)
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }


    }
}
