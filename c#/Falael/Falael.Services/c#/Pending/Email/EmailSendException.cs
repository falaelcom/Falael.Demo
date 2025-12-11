using System.Net;

namespace Falael.Services
{
	public class EmailSendException : Exception
	{
		public EmailSendException(EmailMessage emailMessage, string message)
			: base(message)
		{
			this.EmailMessage = emailMessage;
		}

		public EmailSendException(EmailMessage emailMessage, string message, Exception? innerException)
			: base(message, innerException)
		{
			this.EmailMessage = emailMessage;
		}

		public EmailSendException(EmailMessage emailMessage, HttpStatusCode errorCode, string errorMessage)
			: base(errorMessage)
		{
			this.EmailMessage = emailMessage;
			this.ErrorCode = errorCode;
		}

		public EmailMessage EmailMessage { get; }
		public HttpStatusCode? ErrorCode { get; }
	}
}