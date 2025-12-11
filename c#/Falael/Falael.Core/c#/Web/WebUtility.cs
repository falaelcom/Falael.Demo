namespace Falael.Core.Web
{
	public static class WebUtility
	{
		#region Nested Types

		public class MimeTypeInfo
		{
			public MimeTypeInfo(string name, bool isBinary)
			{
				this.Name = name;
				this.IsBinary = isBinary;
			}

			public static readonly MimeTypeInfo Default = new("application/octet-stream", true);

			public string Name { get; }
			public bool IsBinary { get; }
		}

		#endregion

		public static string ExtractJson(string text)
		{
			int firstBracket = text.IndexOfAny(['{', '[']);
			int lastBracket = text.LastIndexOfAny(['}', ']']);

			if (firstBracket == -1 || lastBracket == -1 || lastBracket < firstBracket) return string.Empty;
			return text.Substring(firstBracket, lastBracket - firstBracket + 1).Trim();
		}

		public static MimeTypeInfo GetMimeType_ByExtension(string fileExtension)
		{
			if (MimeTypes.TryGetValue(fileExtension.ToLower(), out MimeTypeInfo? mimeType)) return mimeType;
			return MimeTypeInfo.Default;
		}

		public static MimeTypeInfo? GetMimeType_ByMimeType(string mimeType)
		{
			foreach (var kvp in MimeTypes) if (kvp.Value.Name == mimeType) return kvp.Value;
			return null;
		}

		public static string? GetExtension_ByMimeType(string mimeType)
		{
			foreach (var kvp in MimeTypes) if (kvp.Value.Name == mimeType) return kvp.Key;
			return null;
		}

		public static readonly MimeTypeInfo MIME_TYPE_HTML = new("text/html", false);
		public static readonly MimeTypeInfo MIME_TYPE_TEXT = new("text/plain", false);
		public static readonly MimeTypeInfo MIME_TYPE_JSON_LINKS = new("application/json-links", false);            //	non-standard

		public static readonly Dictionary<string, MimeTypeInfo> MimeTypes = new()
		{
			{ ".json-links", MIME_TYPE_JSON_LINKS },																//	non-standard

			{ ".jpg", new MimeTypeInfo("image/jpeg", true) },
			{ ".jpeg", new MimeTypeInfo("image/jpeg", true) },
			{ ".png", new MimeTypeInfo("image/png", true) },
			{ ".gif", new MimeTypeInfo("image/gif", true) },
			{ ".bmp", new MimeTypeInfo("image/bmp", true) },
			{ ".svg", new MimeTypeInfo("image/svg+xml", false) },
			{ ".txt", MIME_TYPE_TEXT },
			{ ".html", MIME_TYPE_HTML },
			{ ".htm", new MimeTypeInfo("text/html", false) },
			{ ".xhtml", new MimeTypeInfo("application/xhtml+xml", false) },
			{ ".css", new MimeTypeInfo("text/css", false) },
			{ ".js", new MimeTypeInfo("application/javascript", false) },
			{ ".json", new MimeTypeInfo("application/json", false) },
			{ ".xml", new MimeTypeInfo("application/xml", false) },
			{ ".csv", new MimeTypeInfo("text/csv", false) },
			{ ".pdf", new MimeTypeInfo("application/pdf", true) },
			{ ".doc", new MimeTypeInfo("application/msword", true) },
			{ ".docx", new MimeTypeInfo("application/vnd.openxmlformats-officedocument.wordprocessingml.document", true) },
			{ ".xls", new MimeTypeInfo("application/vnd.ms-excel", true) },
			{ ".xlsx", new MimeTypeInfo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", true) },
			{ ".ppt", new MimeTypeInfo("application/vnd.ms-powerpoint", true) },
			{ ".pptx", new MimeTypeInfo("application/vnd.openxmlformats-officedocument.presentationml.presentation", true) },
			{ ".mp3", new MimeTypeInfo("audio/mpeg", true) },
			{ ".wav", new MimeTypeInfo("audio/wav", true) },
			{ ".mp4", new MimeTypeInfo("video/mp4", true) },
			{ ".avi", new MimeTypeInfo("video/x-msvideo", true) },
			{ ".mov", new MimeTypeInfo("video/quicktime", true) },
			{ ".zip", new MimeTypeInfo("application/zip", true) },
			{ ".rar", new MimeTypeInfo("application/x-rar-compressed", true) },
			{ ".webp", new MimeTypeInfo("image/webp", true) },
			{ ".ogg", new MimeTypeInfo("audio/ogg", true) },
			{ ".ogv", new MimeTypeInfo("video/ogg", true) },
			{ ".ico", new MimeTypeInfo("image/x-icon", true) },
			{ ".flv", new MimeTypeInfo("video/x-flv", true) },
			{ ".mkv", new MimeTypeInfo("video/x-matroska", true) },
			{ ".ts", new MimeTypeInfo("video/mp2t", true) },
			{ ".woff", new MimeTypeInfo("font/woff", true) },
			{ ".woff2", new MimeTypeInfo("font/woff2", true) },
			{ ".eot", new MimeTypeInfo("application/vnd.ms-fontobject", true) },
			{ ".ttf", new MimeTypeInfo("font/ttf", true) },
			{ ".otf", new MimeTypeInfo("font/otf", true) },
			{ ".7z", new MimeTypeInfo("application/x-7z-compressed", true) },
			{ ".tar", new MimeTypeInfo("application/x-tar", true) },
			{ ".gz", new MimeTypeInfo("application/gzip", true) },
			{ ".tgz", new MimeTypeInfo("application/gzip", true) },
			{ ".epub", new MimeTypeInfo("application/epub+zip", true) },
			{ ".mobi", new MimeTypeInfo("application/x-mobipocket-ebook", true) },
			{ ".apng", new MimeTypeInfo("image/apng", true) },
			{ ".avif", new MimeTypeInfo("image/avif", true) },
		};
	}
}