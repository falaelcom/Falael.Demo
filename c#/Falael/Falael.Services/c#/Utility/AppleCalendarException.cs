using System;
using System.Runtime.Serialization;
using WebDav;

namespace Falael.Services
{
	public class AppleCalendarException : Exception
	{
		public AppleCalendarException(DateTime start, TimeSpan duration, string summary, string description, int priority, bool transparent, string url, string message, WebDavResponse? webDavResponse = null)
			: base(message)
		{
			this.Start = start;
			this.Duration = duration;
			this.Summary = summary;
			this.Description = description;
			this.Priority = priority;
			this.Transparent = transparent;
			this.Url = url;
			this.WebDavResponse = webDavResponse;
		}

		public AppleCalendarException(DateTime start, TimeSpan duration, string summary, string description, int priority, bool transparent, string url, string message, Exception? innerException)
			: base(message, innerException)
		{
			this.Start = start;
			this.Duration = duration;
			this.Summary = summary;
			this.Description = description;
			this.Priority = priority;
			this.Transparent = transparent;
			this.Url = url;
		}

		public DateTime Start { get; }
		public TimeSpan Duration { get; }
		public string Summary { get; }
		public string Description { get; }
		public int Priority { get; }
		public bool Transparent { get; }
		public string Url { get; }
		public WebDavResponse? WebDavResponse { get; }
	}
}