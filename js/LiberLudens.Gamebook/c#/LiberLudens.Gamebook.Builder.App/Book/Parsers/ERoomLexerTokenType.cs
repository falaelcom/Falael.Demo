// R1Q2/daniel
//	- doc

namespace LiberLudens.Gamebook.Builder.Book.Parsers
{
	/// <summary>
	/// The type of the <see cref="RoomLexer.Lex(string, System.Action{ERoomLexerTokenType, string, int, int}, System.Action{RoomLexerException}, RoomLexerOptions)"/> token.
	/// </summary>
	public enum ERoomLexerTokenType
	{
		/// <summary>
		/// Whitespace: ' ' or '\t'.
		/// </summary>
		Whitespace,
		/// <summary>
		/// A single new line marked by '\r'.
		/// </summary>
		Newline_CR,
		/// <summary>
		/// A single new line marked by '\n'.
		/// </summary>
		Newline_LF,
		/// <summary>
		/// A single new line marked by '\r\n'.
		/// </summary>
		Newline_CRLF,
		/// <summary>
		/// A single new line marked by '\n\r'.
		/// </summary>
		Newline_LFCR,

		/// <summary>
		/// Within a JSON block. Whitespace: ' ' or '\t'.
		/// </summary>
		Json_Whitespace,
		/// <summary>
		/// Within a JSON block. A single new line marked by '\r'.
		/// </summary>
		Json_Newline_CR,
		/// <summary>
		/// Within a JSON block. A single new line marked by '\n'.
		/// </summary>
		Json_Newline_LF,
		/// <summary>
		/// Within a JSON block. A single new line marked by '\r\n'.
		/// </summary>
		Json_Newline_CRLF,
		/// <summary>
		/// Within a JSON block. A single new line marked by '\n\r'.
		/// </summary>
		Json_Newline_LFCR,
		/// <summary>
		/// Within a JSON block. The '{' character.
		/// </summary>
		Json_Structural_OpeningCurlyBracket,
		/// <summary>
		/// Within a JSON block. The '}' character.
		/// </summary>
		Json_Structural_ClosingCurlyBracket,
		/// <summary>
		/// Within a JSON block. The '[' character.
		/// </summary>
		Json_Structural_OpeningSquareBracket,
		/// <summary>
		/// Within a JSON block. The ']' character.
		/// </summary>
		Json_Structural_ClosingSquareBracket,
		/// <summary>
		/// Within a JSON block. The ':' character.
		/// </summary>
		Json_Structural_Colon,
		/// <summary>
		/// Within a JSON block. The ',' character.
		/// </summary>
		Json_Structural_Comma,
		/// <summary>
		/// Within a JSON block. The true literal.
		/// </summary>
		Json_Literal_True,
		/// <summary>
		/// Within a JSON block. The false literal.
		/// </summary>
		Json_Literal_False,
		/// <summary>
		/// Within a JSON block. The null literal.
		/// </summary>
		Json_Literal_Null,
		/// <summary>
		/// Within a JSON block. A JSON number.
		/// </summary>
		Json_Literal_Number,
		/// <summary>
		/// Within a JSON block. A JSON string.
		/// </summary>
		Json_Literal_String,
	}
}
