// R1Q1?/daniel
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LiberLudens.Gamebook.Builder.Book.Parsers
{
	/// <summary>
	/// Configuration for the <see cref="RoomLexer"/>.
	/// </summary>
	public class RoomLexerOptions
	{
		/// <summary>
		/// Represents the default lexer options. This field is read-only.
		/// </summary>
		public static readonly RoomLexerOptions Default = new RoomLexerOptions();

		/// <summary>
		/// If set to true will case the <see cref="RoomLexer"/> to process all escape sequences in strings and yield string that are ready to use; otherwise string literals are copied literally from the JSON input. The default value is false.
		/// </summary>
		public bool DecodeStrings = false;
		/// <summary>
		/// If set to true causes the <see cref="RoomLexer.Lex(string, Action{ERoomLexerTokenType, string, int, int}, Action{RoomLexerException}, RoomLexerOptions)"/> function to throw an exception on lexer error, otherwize exceptions are suppressed. In the latter case, the exceptions can be accessed through the errorCallback. The default value is false.
		/// </summary>
		public bool ThrowLexerExceptions = false;
	}
}
