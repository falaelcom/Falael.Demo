namespace Falael.Services
{
	public interface IEmailSend
	{
		Task SendAsync(EmailMessage emailMessage);
	}
}
