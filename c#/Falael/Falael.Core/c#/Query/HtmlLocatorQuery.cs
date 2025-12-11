//	R0Q4/daniel/20250914
using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;

using static Falael.Core.Query.HtmlLocatorQuery;
using static Falael.Core.Query.RegexLocatorQuery;

namespace Falael.Core.Query
{
	public partial class HtmlLocatorQuery
	{
		public HtmlLocatorQuery(string subject)
		{
			this.regexLocatorQuery = new(subject);
		}

		[Flags]
		public enum AttributeOptions
		{
			None = 0,
			Anchored = 1,
			Backwards = 2,
			CaptureAttributeName = 4,
			CaptureAttributeValue = 8,
		}

		[Flags]
		public enum TagOptions
		{
			None = 0,
			Anchored = 1,
			Backwards = 2,
			CaptureTagName = 4,
			AcceptOpeningTag = 8,
			AcceptClosingTag = 16,
			AcceptSelfClosingTag = 32,
		}

		[Flags]
		public enum TagBodyOptions
		{
			None = 0,
			Anchored = 1,
			Backwards = 2,
			CaptureTagName = 4,
			CaptureOpeningTag = 8,
			CaptureBody = 16,
		}

		public class AttributeFilter
		{
			public AttributeFilter(string name, string value, bool inverted = false)
			{
				this.Name = name;
				this.Value = value;
				this.Inverted = inverted;
			}

			public string Name;
			public string Value;
			public bool Inverted;
		}

		public const string Spaces = @"\s*";
		public const string MultilineAny = @"[\s\S]*?";
		public const string AnyQuote = @"[""']";
		public const string WordBreak = @"\b";
		public const string QuotedContent = @"[^""']*";

		public static Regex HtmlAttributeRegex(string name, string value, AttributeOptions options)
		{
			var sb = new StringBuilder();

			if (options.HasFlag(AttributeOptions.Anchored) && !options.HasFlag(AttributeOptions.Backwards)) sb.Append('^');

			sb.Append(WordBreak);
			
			if (options.HasFlag(AttributeOptions.CaptureAttributeName)) sb.Append('(');
			sb.Append(name);
			if (options.HasFlag(AttributeOptions.CaptureAttributeName)) sb.Append(')');

			sb.Append(Spaces);
			
			sb.Append('=');
			sb.Append(Spaces);
			sb.Append(AnyQuote);

			if (options.HasFlag(AttributeOptions.CaptureAttributeValue)) sb.Append('(');
			sb.Append(value);
			if (options.HasFlag(AttributeOptions.CaptureAttributeValue)) sb.Append(')');

			sb.Append(AnyQuote);

			if (options.HasFlag(AttributeOptions.Anchored) && options.HasFlag(AttributeOptions.Backwards)) sb.Append('$');

			var regexOptions = options.HasFlag(AttributeOptions.Backwards)
				? RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.RightToLeft
				: RegexOptions.Compiled | RegexOptions.IgnoreCase;
			return new Regex(sb.ToString(), regexOptions);
		}

		public static Regex HtmlTagRegex(string name, TagOptions options, AttributeFilter[]? attributeFilters = null)
		{
			var sb = new StringBuilder();

			if(options.HasFlag(TagOptions.Anchored) && !options.HasFlag(TagOptions.Backwards)) sb.Append('^');

			sb.Append('<');
			sb.Append(Spaces);

			if (options.HasFlag(TagOptions.AcceptClosingTag))
			{
				sb.Append('/');
				if (options.HasFlag(TagOptions.AcceptOpeningTag)) sb.Append('?');
				sb.Append(Spaces);
			}

			if (options.HasFlag(TagOptions.CaptureTagName)) sb.Append('(');

			sb.Append(name);

			if (options.HasFlag(TagOptions.CaptureTagName)) sb.Append(')');

			sb.Append(WordBreak);
			sb.Append(Spaces);
			if(attributeFilters != null) foreach (var attr in attributeFilters)
			{
				sb.Append(attr.Inverted ? "(?!" : "(?=");
				sb.Append(@"[^>]*");
				sb.Append(WordBreak);
				sb.Append(attr.Name);
				sb.Append(WordBreak);
				sb.Append(Spaces);
				sb.Append('=');
				sb.Append(Spaces);
				sb.Append(AnyQuote);
				sb.Append(attr.Value);
				sb.Append(AnyQuote);
				sb.Append(')');
			}
			if (options.HasFlag(TagOptions.AcceptSelfClosingTag)) sb.Append(@"[^>]*\/>");
			else sb.Append(@"[^>]*>(?<!\/>)");

			if (options.HasFlag(TagOptions.AcceptClosingTag))
			{
				sb.Append(MultilineAny);
				sb.Append("</");
				sb.Append(name);
				sb.Append(@"\s*>");
			}

			if (options.HasFlag(TagOptions.Anchored) && options.HasFlag(TagOptions.Backwards)) sb.Append('$');

			var regexOptions = options.HasFlag(TagOptions.Backwards) 
				? RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.RightToLeft 
				: RegexOptions.Compiled | RegexOptions.IgnoreCase;
			return new Regex(sb.ToString(), regexOptions);
		}

		public static Regex HtmlTagRegex(string name, AttributeFilter[]? attributeFilters = null) => 
			HtmlTagRegex(name, 
				TagOptions.AcceptOpeningTag | TagOptions.AcceptSelfClosingTag | TagOptions.CaptureTagName, 
				attributeFilters);

		public static Regex HtmlTagRegex(string name, TagOptions options = TagOptions.AcceptOpeningTag | TagOptions.AcceptSelfClosingTag | TagOptions.CaptureTagName) => HtmlTagRegex(name, options, null);

		/// <remarks>
		/// Capture order (each option counts only if specified):
		/// - capture `[0]` is always the whole matched string
		/// - `TagBodyOptions.CaptureOpeningTag`
		/// - `TagBodyOptions.CaptureTagName`
		/// - `TagBodyOptions.CaptureBody`
		/// </remarks>
		public static Regex HtmlTagBodyRegex(string name, TagBodyOptions options, string body, AttributeFilter[]? attributeFilters = null)
		{
			var sb = new StringBuilder();

			if (options.HasFlag(TagBodyOptions.Anchored) && !options.HasFlag(TagBodyOptions.Backwards)) sb.Append('^');

			if (options.HasFlag(TagBodyOptions.CaptureOpeningTag)) sb.Append('(');

			sb.Append('<');
			sb.Append(Spaces);

			if (options.HasFlag(TagBodyOptions.CaptureTagName)) sb.Append('(');

			sb.Append(name);

			if (options.HasFlag(TagBodyOptions.CaptureTagName)) sb.Append(')');

			sb.Append(WordBreak);
			sb.Append(Spaces);
			if (attributeFilters != null) foreach (var attr in attributeFilters)
			{
				sb.Append(attr.Inverted ? "(?!" : "(?=");
				sb.Append(@"[^>]*");
				sb.Append(WordBreak);
				sb.Append(attr.Name);
				sb.Append(WordBreak);
				sb.Append(Spaces);
				sb.Append('=');
				sb.Append(Spaces);
				sb.Append(AnyQuote);
				sb.Append(attr.Value);
				sb.Append(AnyQuote);
				sb.Append(')');
			}
			sb.Append(@"[^/>]*>");

			if (options.HasFlag(TagBodyOptions.CaptureOpeningTag)) sb.Append(')');

			if (options.HasFlag(TagBodyOptions.CaptureBody)) sb.Append('(');

			sb.Append(body);

			if (options.HasFlag(TagBodyOptions.CaptureBody)) sb.Append(')');

			sb.Append('<');
			sb.Append(Spaces);
			sb.Append('/');
			sb.Append(Spaces);
			sb.Append(name);
			sb.Append(WordBreak);
			sb.Append(Spaces);
			sb.Append('>');

			if (options.HasFlag(TagBodyOptions.Anchored) && options.HasFlag(TagBodyOptions.Backwards)) sb.Append('$');

			var regexOptions = options.HasFlag(TagBodyOptions.Backwards)
				? RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.RightToLeft
				: RegexOptions.Compiled | RegexOptions.IgnoreCase;
			return new Regex(sb.ToString(), regexOptions);
		}


		public static Regex TwigFieldRegex(string name)
		{
			var sb = new StringBuilder();

			sb.Append(Spaces);
			sb.Append("{{");
			sb.Append(Spaces);

			sb.Append(name);

			sb.Append(Spaces);
			sb.Append("}}");
			sb.Append(Spaces);

			var regexOptions = RegexOptions.Compiled | RegexOptions.IgnoreCase;
			return new Regex(sb.ToString(), regexOptions);
		}


		public string Subject => this.regexLocatorQuery.Subject;

		RegexLocatorQuery regexLocatorQuery;
	}
}
