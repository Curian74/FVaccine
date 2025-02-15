using Microsoft.Extensions.Options;
using System.Net.Mail;
using System.Net;
using VaccinationManagement.Models;
using VaccinationManagement.Models.Configs;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace VaccinationManagement.Features.EmailFeature.Command
{
	public class SendEmailCommand
	{
		public required string ToEmail { get; set; }
		public string Subject { get; set; } = string.Empty;
		public required string Body { get; set; }
	}

	public class SendEmailCommandHandler
	{
		private readonly EmailConfig _emailConfig;

		public SendEmailCommandHandler(IOptions<EmailConfig> emailConfig)
		{
			_emailConfig = emailConfig.Value;
		}

		public async Task<bool> Handle(SendEmailCommand command)
		{
			var apiKey = _emailConfig.Key;
			var client = new SendGridClient(apiKey);
			var from = new EmailAddress(_emailConfig.OwnerMail, _emailConfig.Company);
			var to = new EmailAddress(command.ToEmail);
			var msg = MailHelper.CreateSingleEmail(from, to, command.Subject, null, command.Body);
			var response = await client.SendEmailAsync(msg);
			return response.StatusCode == System.Net.HttpStatusCode.Accepted;
		}
	}
}
