using MediatR;
using Microsoft.AspNetCore.Mvc;
using VaccinationManagement.Features.CustomerFeature.Queries;

// using VaccinationManagement.Features.VaccinationResultFeature.Commands;
using VaccinationManagement.Features.VaccinationResultFeature.Queries;
using VaccinationManagement.Features.VaccineFeature.Queries;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : Controller
    {
        private readonly IMediator _mediator;

        public ReportController(IMediator mediator)
        {
            _mediator = mediator;
        }

		[HttpGet("monthly-summary")]
		public async Task<IActionResult> GetMonthlyInjectionSummary(int year)
		{
			var result = await _mediator.Send(new GetMonthlyInjectionSummaryQuery { Year = year });
			return Ok(result);
		}

		[HttpGet("monthly-vaccine-summary")]
		public async Task<IActionResult> GetMonthlyVaccineSummary(int year, string vaccineId)
		{
			var result = await _mediator.Send(new GetMonthlyInjectionSummaryQuery { Year = year, VaccineId = vaccineId });
			return Ok(result);
		}
		[HttpGet("monthly-customer-summary")]
		public async Task<IActionResult> GetMonthlyCustomerSummary(int year, string customerId)
		{
			var result = await _mediator.Send(
				new GetMonthlyInjectionSummaryQuery
				{ Year = year, CustomerId = customerId });
			return Ok(result);
		}

		[HttpGet("annual-vaccine")]
		public async Task<IActionResult> GetAnnualVaccineSummary(int year, string customerId)
		{
			var result = await _mediator.Send(
				new GetCustomerAnnualVaccineQuery
				{ Year = year, CustomerId = customerId });
			return Ok(result);
		}
		
		[HttpGet("statistic-vaccine")]
		public async Task<IActionResult> GetCustomerUsingVaccine(int year, string vaccineId)
		{
			var result = await _mediator.Send(
				new GetCustomerUsingAnnualVaccineQuery
				{ Year = year, VaccineId = vaccineId});
			return Ok(result);
		}
		
		[HttpGet("statistic-vaccine-by-year")]
		public async Task<IActionResult> GetStatistcVaccineByYear(int year)
		{
			var result = await _mediator.Send(
				new GetVaccineStatisticByYearQuery { Year = year });
			return Ok(result);
		}
	}
}
