using SendGrid.Helpers.Mail;
using System.Text.Encodings.Web;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Text;
using System.Diagnostics;

using MimeKit;

namespace Falael.Services
{
	public class EmailMessage
	{
		public EmailMessage(string senderName, string senderEmail, string recipientName, string recipientEmail, string subject, string text, Dictionary<string, string>? attachments = null)
		{
			this.SenderName = senderName;
			this.SenderEmail = senderEmail;
			this.RecipientName = recipientName;
			this.RecipientEmail = recipientEmail;
			this.Subject = subject;
			this.Text = text;
			this.Attachments = attachments;
		}

		public SendGridMessage ToSendGridMessage()
		{
			var from = new EmailAddress(this.SenderEmail, this.SenderName);
			var to = new EmailAddress(this.RecipientEmail, this.RecipientName);
			var plainTextContent = this.Text;
			var htmlContent = $"<pre style=\"font-family: Courier New; font-size: 10pt;\">{this.Text}</pre>";
			var result = MailHelper.CreateSingleEmail(from, to, this.Subject, plainTextContent, htmlContent);

			if (this.Attachments == null) return result;

			foreach (var item in this.Attachments) result.AddAttachment(new Attachment
			{
				Filename = item.Key,
				Content = Convert.ToBase64String(Encoding.UTF8.GetBytes(item.Value))
			});

			return result;
		}

		public MimeMessage ToMimeKitMessage()
		{
			var from = new MailboxAddress(this.SenderName, this.SenderEmail);
			var to = new MailboxAddress(this.RecipientName, this.RecipientEmail);
			var plainTextContent = this.Text;
			var htmlContent = $"<pre style=\"font-family: Courier New; font-size: 10pt;\">{this.Text}</pre>";

			var result = new MimeMessage();
			result.From.Add(from);
			result.To.Add(to);
			result.Subject = this.Subject;

			var multipart = new Multipart("mixed")
				{
					new Multipart("alternative")
					{
						new TextPart("plain") { Text = plainTextContent },
						new TextPart("html") { Text = htmlContent },
					}
				};
			if (this.Attachments != null)
			{
				foreach (var item in this.Attachments)
				{
					var attachment = new MimePart(MimeTypes.GetMimeType(item.Key))
					{
						Content = new MimeContent(new MemoryStream(Encoding.UTF8.GetBytes(item.Value))),
						ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
						ContentTransferEncoding = ContentEncoding.Base64,
						FileName = item.Key
					};
					multipart.Add(attachment);
				}
			}
			result.Body = multipart;
			return result;
		}

		public string GetAttachmentsJSON()
		{
			return JsonSerializer.Serialize(this.Attachments, new JsonSerializerOptions
			{
				WriteIndented = true,
				DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
				Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
			});
		}

		[JsonPropertyName("senderName")]
		public string SenderName { get; }
		
		[JsonPropertyName("senderEmail")]
		public string SenderEmail { get; }

		[JsonPropertyName("recipientName")]
		public string RecipientName { get; }

		[JsonPropertyName("recipientEmail")]
		public string RecipientEmail { get; }

		[JsonPropertyName("subject")]
		public string Subject { get; }

		[JsonPropertyName("text")]
		public string Text { get; }

		[JsonPropertyName("attachments")]
		public Dictionary<string, string>? Attachments { get; }
	}
}
