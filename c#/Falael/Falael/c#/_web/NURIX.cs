using System.Text.Json;
using System.Text.Json.Serialization;

namespace Falael
{
	/// <summary>
	/// This `NURIX` class represents a **URI chain with redirect history** - it's essentially a collection of `NURI` objects that tracks the path a URL has taken through redirects or transformations.
	/// 
	/// **Tag Purposes:**
	/// 
	/// **Redirect Chain Tracking**
	/// - `Hops` array stores the sequence of URIs in a redirect chain
	/// - The canonical/final URI is the last hop (`CanonicalNuri` property)
	/// - Can track how a URL evolved through multiple redirects (301s, 302s, etc.)
	/// 
	/// **String Serialization Format**
	/// - Uses `" <-- "` as a separator to represent the chain as a string
	/// - Example: `"final-url.com <-- intermediate.com <-- original-url.com"`
	/// - The `FromString` method parses this format back into a NURIX object
	/// - Reverses the order when parsing (rightmost is the original, leftmost is final)
	/// 
	/// **Immutability Control**
	/// - `Sealed` property prevents further modifications once finalized
	/// - `AppendHop()` method adds new URIs to the chain (only if not sealed)
	/// - Useful for building up a redirect chain then locking it
	/// 
	/// **Canonical URL Management**
	/// - Implements the concept of canonical URLs (mentioned in the comment referencing Ahrefs)
	/// - The final hop represents the canonical/authoritative version of the URL
	/// - Helps with SEO and deduplication where multiple URLs point to the same content
	/// 
	/// **Use Cases:**
	/// - **Web Crawling**: Track redirect chains when following links
	/// - **SEO Analysis**: Understand canonical URL relationships
	/// - **Link Analysis**: See the full path from original to final URL
	/// - **Deduplication**: Treat different URLs in the same chain as equivalent
	/// - **Analytics**: Track how users navigate through redirects
	/// 
	/// The name "NURIX" likely stands for "Normalized URI eXtended" or "NURI eXtended", building on the `NURI` class to handle collections/chains of normalized URIs.
	/// </summary>
	/// <remarks>
	/// - canonical urls - <see href="https://ahrefs.com/blog/canonical-tags/"/>
	/// </remarks>
    /// <seealso cref="NURI"/>
	[JsonConverter(typeof(JsonStringConverter))]
    public class NURIX
    {
        static readonly string[] SplitSeparator = ["<--"];
        static readonly string ConcatenateSeparator = " <-- ";

        #region Constructors

        public NURIX()
        {
			this.Hops = [];
        }

        public NURIX(string uri)
        {
			this.Hops = [new(uri)];
        }

        public NURIX(string uriString, in UriCreationOptions creationOptions)
        {
			this.Hops = [new(uriString, creationOptions)];
        }

        public NURIX(string uriString, UriKind uriKind)
        {
			this.Hops = [new(uriString, uriKind)];
        }

        public NURIX(Uri baseUri, string? relativeUri)
        {
			this.Hops = [new(baseUri, relativeUri)];
        }

        public NURIX(Uri baseUri, Uri relativeUri)
        {
			this.Hops = [new(baseUri, relativeUri)];
        }

        public NURIX(Uri uri)
        {
			this.Hops = [new(uri)];
        }

        public NURIX(NURI nuri)
        {
			this.Hops = [nuri];
        }


        public NURIX(NURI[] hops)
        {
			this.Hops = hops;
        }

        public static NURIX FromString(string value)
        {
            if (value.Trim() == string.Empty) return new NURIX();
            return new NURIX(
                value.Split(SplitSeparator, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Reverse()
                .Select(v => new NURI(NURI.EnsureUrlScheme(v))).ToArray()
            );
        }

        #endregion

        #region Equation

        public static bool operator ==(NURIX left, NURIX right)
        {
            if (left is null) return right is null;
            return left.Equals(right);
        }

        public static bool operator !=(NURIX left, NURIX right)
        {
            return !(left == right);
        }

        public override bool Equals(object? obj)
        {
            if (obj is null) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;

            var other = (NURIX)obj;
            if (this.Hops == null && other.Hops == null) return true;
            if (this.Hops == null || other.Hops == null) return false;
            if (this.Hops.Length != other.Hops.Length) return false;

            for (int i = 0; i < this.Hops.Length; i++) if (!this.Hops[i].Equals(other.Hops[i])) return false;

            return true;
        }

        public override int GetHashCode()
        {
            return this.Hops.Aggregate(0, (r, v) => r ^ v.GetHashCode());
        }

        #endregion

        #region Serialization

        public class JsonStringConverter : JsonConverter<NURIX>
        {
            public override NURIX? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                if (reader.TokenType != JsonTokenType.String) throw new FormatException("NURIX must be a string.");
                var jsonString = reader.GetString();
                if (string.IsNullOrEmpty(jsonString)) throw new FormatException("NURIX must be a non-empty string.");
                return FromString(jsonString);
            }

            public override void Write(Utf8JsonWriter writer, NURIX value, JsonSerializerOptions options)
            {
                writer.WriteStringValue(value.ToString());
            }
        }

        #endregion

        public override string ToString()
        {
            return string.Join(ConcatenateSeparator, this.Hops.Reverse());
        }

        public bool HasHop(NURI uri)
        {
            return this.Hops.Any(v => v == uri);
        }

        public void AppendHop(NURI uri)
        {
            if (this.Sealed) throw new InvalidOperationException("NURIX instance is sealed.");
			this.Hops = [.. this.Hops, uri];
        }

        public void Seal()
        {
            if (this.Sealed) throw new InvalidOperationException("NURIX instance is already sealed.");
			this.Sealed = true;
        }

        public bool IsEmpty
        {
            get
            {
                return this.Hops.Length == 0;
            }
        }

        public NURI CanonicalNuri
        {
            get
            {
                if (this.IsEmpty) throw new InvalidOperationException("Cannot get Uri on an empty NURIX.");
                return this.Hops[^1];
            }
        }

        public NURI[] Hops { get; private set; }
        public bool Sealed { get; private set; } = false;
    }
}