using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VaccinationManagement.Data;
using VaccinationManagement.Features.CustomerFeature.Queries;
using VaccinationManagement.Features.EmployeeFeature.Commands;
using VaccinationManagement.Features.EmployeeFeature.Queries;
using VaccinationManagement.Features.NewsFeature.Commands;
using VaccinationManagement.Features.NewsFeature.Queries;
using VaccinationManagement.Models;
using VaccinationManagement.Services;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace VaccinationManagement.Controllers
{
    [Route("api/news")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;

        public NewsController(ApplicationDbContext context, IMediator mediator, IWebHostEnvironment env)
        {
            _context = context;
            _mediator = mediator;
            _env = env;
        }

        //GET ALL NEWS API
        //api/news
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] GetNews query)
        {
            var newsListResult = await _mediator.Send(query);
            return Ok(newsListResult);
        }

        // [HttpPut("status")]
        // public async Task<IActionResult> UpdateEmployeesStatus([FromBody] UpdateNewsStatus command)
        // {
        //     try
        //     {
        //         var result = await _mediator.Send(command);

        //         if (result)
        //             return Ok(new { message = "News's status changed successfully." });
        //         else
        //             return NotFound(new { message = "No news found to update." });
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { error = ex.Message });
        //     }
        // }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            try
            {
                var news = await _mediator.Send(new GetNewsById { Id = id });
                return Ok(news);
            }

            catch(KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message});
            }

            catch(Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("next-id")]
        public ActionResult<string>? GetNextId()
        {
            try
            {
                var latestId = _context.News.Max(x => x.Id);

                if (latestId == null)
                {
                    return "NW000001";
                }

                var nextId = NewId(latestId);

                return Ok(nextId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string NewId(string id)
        {
            string s = id.Substring(2);
            while (s[0] == '0')
            {
                s = s.Remove(0, 1);
            }
            int num = int.Parse(s) + 1;
            string rs = num.ToString();
            while (rs.Length < 6)
            {
                rs = "0" + rs;
            }
            return "NW" + rs;
        }

        [HttpPost]
        public async Task<IActionResult> CreateNews(CreateNews command)
        {
            try
            {
                var news = await _mediator.Send(command);
                if (news == null)
                {
                    return BadRequest("Error");
                }
                return CreatedAtAction("GetById", new { id = news.Id }, news);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNews([FromRoute]string id, [FromBody]UpdateNews command)
        {
            try
            {
                command.Id = id;
                var updatedNews = await _mediator.Send(command);
                return Ok(updatedNews);
            }

            catch(ArgumentException ae)
            {
                return BadRequest(new { message = ae.Message });
            }

            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred: " + ex.Message);
            }
        }

        [HttpGet("get-by-type")]
        public async Task<IActionResult> GetListNewsByNewsTypeId([FromQuery]
            GetListNewsByNewsTypeId query)
        {
            var newsListResult = await _mediator.Send(query);
            return Ok(newsListResult);
        }

        [HttpPost("thumbnail-upload")]
        public async Task<IActionResult> UploadThumbnail(IFormFile file)
        {
            ImageUpload imageUpload = new(_env);
            var url = await imageUpload.HandleImageUpload(file, "news", "images");

            return Ok(url);
        }
    }
}
