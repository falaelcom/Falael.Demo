using SendGrid;

namespace Falael.Services
{
	public class SendGridApiClient : FalaelContextAware, IEmailSend
	{
		const ulong LGID = 0xE97572;

		public SendGridApiClient(IFalaelContext coreContext, Configuration configuration)
			: base(coreContext)
		{
			this.configuration = configuration;

			this.sendGridClient = new SendGridClient(this.configuration.Service_SendGrid_ApiKey);
		}

		#region Configuration

		#pragma warning disable CS8618
		[ConfigurationClass]
		public class Configuration
		{
			[ConfigurationField("service.sendGrid.apiKey")]
			public string Service_SendGrid_ApiKey { get; init; } = string.Empty;
		}
		#pragma warning restore CS8618

		#endregion

		#region IEmailSend

		public async Task SendAsync(EmailMessage emailMessage)
		{
			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xADB243),
				nameof(SendGridApiClient),
				nameof(SendAsync),
				"from", CL33($"\"{emailMessage.SenderName}\" <{emailMessage.SenderEmail}>"),
				"to", CL33($"\"{emailMessage.RecipientName}\" <{emailMessage.RecipientEmail}>"),
				"text", CL513(emailMessage.Text),
				"att", CL1025(emailMessage.GetAttachmentsJSON()));

			try
			{
				var response = await this.sendGridClient.SendEmailAsync(emailMessage.ToSendGridMessage());
				if (response.IsSuccessStatusCode) this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x6B8B50), nameof(SendGridApiClient), nameof(SendAsync), "Done.");
				else throw new EmailSendException(emailMessage, response.StatusCode, await response.Body.ReadAsStringAsync());
			}
			catch (EmailSendException)
			{
				throw;
			}
			catch (Exception ex)
			{
				throw new EmailSendException(emailMessage, "Unable to send email.", ex);
			}
		}

		#endregion

		readonly SendGridClient sendGridClient;
		readonly Configuration configuration;
	}
}
