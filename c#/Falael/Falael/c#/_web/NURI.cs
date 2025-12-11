using System.Web;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Falael
{
	/// <summary>
	/// This is a custom URI wrapper class called `NURI` (likely "Normalized URI") that extends the functionality of .NET's built-in `Uri` class. Its main purposes are:
	/// 
	/// **URI Normalization & Standardization**
	/// - Normalizes URIs into consistent formats for comparison and storage
	/// - Handles subdomain normalization (strip/ensure "www.")
	/// - Sorts query parameters alphabetically
	/// - Removes trailing slashes from paths
	/// - Provides different normalization profiles (Default, Uniform, GptStub)
	/// 
	/// **Enhanced URI Operations**
	/// - Adds equality operators and proper `Equals`/`GetHashCode` implementations
	/// - JSON serialization support through a custom converter
	/// - Multiple constructor overloads wrapping `Uri` constructors
	/// 
	/// **Specialized Properties**
	/// - `UniformUri`: A consistently normalized version for reliable comparisons
	/// - `GptUrl`: Replaces the host with "HOST" placeholder (probably for GPT prompts where you want to anonymize the actual domain)
	/// - `ULI`: A custom hash-based identifier using Base72 SHA256 encoding
	/// - `IsAboutBlank`: Convenience check for "about:blank"
	/// 
	/// **Domain Intelligence**
	/// - Contains a curated list of multi-part TLDs (like "co.uk", "com.au") to intelligently handle www subdomain addition
	/// - The `EnsureHostWww` method knows not to add "www" to domains that already have meaningful subdomains
	/// 
	/// This class seems designed for applications that need to:
	/// - Store/compare URIs reliably (deduplication, caching)
	/// - Generate consistent identifiers from URLs
	/// - Work with AI/GPT systems (based on the GptUrl property)
	/// - Handle international domain structures properly
	/// 
	/// It's essentially a "smarter URI" that knows how to normalize itself for consistent processing.    
    /// /// </summary>
	[JsonConverter(typeof(JsonStringConverter))]
    public class NURI
    {
        public const string DEFAULT_SCHEME = "https://";

        public const string ABOUT_BLANK = "about:blank";

        /// <summary>
        /// This is only a partial list of the most common relevant TLDs. A compehensive list might be found here: https://tld-list.com/tlds-from-a-z
        /// </summary>
        static readonly HashSet<string> dotContainingTlds =
        [
            "co.uk", "com.au", "gov.uk", "org.uk", "co.nz", "com.br", "co.za", "com.cn",
            "co.in", "co.jp", "ne.jp", "or.jp", "com.mx", "com.tw", "com.hk", "com.sg",
            "co.kr", "ne.kr", "or.kr", "com.ar", "com.ua", "com.tr", "com.my", "com.ph",
            "co.id", "co.th", "com.eg", "com.sa", "com.vn", "co.ve", "co.il", "co.ir",
            "com.pk", "co.ke", "co.ao", "com.bd", "co.tz", "com.lk", "com.gh", "com.np",
            "co.ug", "co.zw", "co.cr", "com.do", "com.sv", "com.gt", "com.jm", "com.pa",
            "com.pr", "com.py", "com.uy", "co.bw", "co.ci", "co.mz", "co.na", "com.bh",
            "com.kw", "com.lb", "com.om", "com.qa", "com.sy", "com.jo", "co.ma", "co.tn",
        ];

        #region Constructors

        public NURI(string uri)
        {
			this.Uri = new Uri(uri);
        }

        public NURI(string uriString, in UriCreationOptions creationOptions)
        {
			this.Uri = new Uri(uriString, creationOptions);
        }

        public NURI(string uriString, UriKind uriKind)
        {
			this.Uri = new Uri(uriString, uriKind);
        }

        public NURI(Uri baseUri, string? relativeUri)
        {
			this.Uri = new Uri(baseUri, relativeUri);
        }

        public NURI(Uri baseUri, Uri relativeUri)
        {
			this.Uri = new Uri(baseUri, relativeUri);
        }

        public NURI(Uri uri)
        {
			this.Uri = uri;
        }

        #endregion

        #region Equation

        public static bool operator ==(NURI? left, NURI? right)
        {
            if (left is null) return right is null;
            return left.Equals(right);
        }

        public static bool operator !=(NURI? left, NURI? right)
        {
            return !(left == right);
        }

        public override bool Equals(object? obj)
        {
            if (obj is null) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return this.Uri == ((NURI)obj).Uri;
        }

        public override int GetHashCode()
        {
            return this.Uri.GetHashCode();
        }

        #endregion

        #region Serialization

        public class JsonStringConverter : JsonConverter<NURI>
        {
            public override NURI? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                if (reader.TokenType != JsonTokenType.String) throw new FormatException("NURI must be a string.");
                var jsonString = reader.GetString();
                if (string.IsNullOrEmpty(jsonString)) throw new FormatException("NURI must be a non-empty string.");
                return new NURI(jsonString);
            }

            public override void Write(Utf8JsonWriter writer, NURI value, JsonSerializerOptions options)
            {
                writer.WriteStringValue(value.ToString());
            }
        }

        #endregion

        #region Nested Types

        public enum DomainNorimalization
        {
            None,
            StripWww,
            EnsureWww,
        }

        public class NormalizationOptions
        {
            public DomainNorimalization NormalizeSubdomain { get; set; } = DomainNorimalization.None;
            public bool IncludeFragment { get; set; } = false;

            public static readonly NormalizationOptions Default = new();
            public static readonly NormalizationOptions Uniform = new()
            {
                NormalizeSubdomain = DomainNorimalization.EnsureWww,
                IncludeFragment = false
            };
            public static readonly NormalizationOptions GptStub = new()
            {
                NormalizeSubdomain = DomainNorimalization.None,
                IncludeFragment = true
            };
        }

        #endregion

        public override string ToString()
        {
            return this.Uri.ToString();
        }

        public NURI ToNormalNuri(NormalizationOptions normalizationOptions)
        {
            return new NURI(NormalizeUri(this.Uri, normalizationOptions));
        }

        public static string EnsureUrlScheme(string url)
        {
            var urllc = url.ToLowerInvariant();

            if (!urllc.StartsWith(Uri.UriSchemeGopher + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeHttp + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeHttps + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeFtp + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeFtps + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeFile + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeMailto + ":") &&
                !urllc.StartsWith(Uri.UriSchemeNetTcp + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeNetPipe + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeNews + ":") &&
                !urllc.StartsWith(Uri.UriSchemeNntp + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeSftp + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeSsh + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeTelnet + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeWs + Uri.SchemeDelimiter) &&
                !urllc.StartsWith(Uri.UriSchemeWss + Uri.SchemeDelimiter))
            {
                return DEFAULT_SCHEME + url;
            }

            return url;
        }

        public static string EnsureHostWww(string host)
        {
            if (host == string.Empty) return host;
            if (host.StartsWith("www.", StringComparison.OrdinalIgnoreCase)) return host;

            var parts = host.Split('.');
            if (parts.Length == 1) return host;
            if (parts.Length == 2) return "www." + host;
            var tldCandidate = string.Join(".", parts[^2..]).ToLowerInvariant();
            var parts_noTld = dotContainingTlds.Contains(tldCandidate) ? parts[..^2] : parts[..^1];
            return parts_noTld.Length == 1 ? "www." + host : host;
        }

        public static Uri NormalizeUri(Uri uri, NormalizationOptions normalizationOptions)
        {
            UriBuilder ub = new(uri);

            //	normalize scheme
            ub.Scheme = ub.Scheme.ToLowerInvariant();

            //	normalize host
            var host = ub.Host.ToLowerInvariant();
            switch (normalizationOptions.NormalizeSubdomain)
            {
                case DomainNorimalization.StripWww: if (host.StartsWith("www.")) host = host[4..]; break;
                case DomainNorimalization.EnsureWww: host = EnsureHostWww(host); break;
                case DomainNorimalization.None: break;
                default: throw new NotImplementedException(normalizationOptions.NormalizeSubdomain.ToString());
            }
            ub.Host = host;

            // normalize path
            var path = ub.Path;
            ub.Path = path.EndsWith('/') ? path[..^1] : path;

            // normalize query
            if (ub.Query != string.Empty)
            {
                var queryParams = HttpUtility.ParseQueryString(ub.Query);
                var sortedParams = queryParams.AllKeys.OrderBy(key => key).Select(key => key + "=" + HttpUtility.UrlEncode(queryParams[key]));
                ub.Query = string.Join("&", sortedParams);
            }

            // normalize fragment
            if (!normalizationOptions.IncludeFragment) ub.Fragment = string.Empty;

            return ub.Uri;
        }


        public bool IsAboutBlank
        {
            get
            {
                return this.Uri.AbsoluteUri == ABOUT_BLANK;
            }
        }


        public Uri Uri { get; private set; }

        public Uri UniformUri
        {
            get
            {
                return this.ToNormalNuri(NormalizationOptions.Uniform).Uri;
            }
        }

        public string GptUrl
        {
            get
            {
                var uri = this.ToNormalNuri(NormalizationOptions.GptStub).Uri;
                var stub = $"{uri.Scheme}://{uri.Host}" + (uri.IsDefaultPort ? "" : $":{uri.Port}");
                return uri.ToString().Replace(stub, "HOST");
            }
        }

        public string ULI
        {
            get
            {
                return HashConverter.GetCustomBase72SHA256Hash(this.UniformUri.ToString());
            }
        }
    }
}