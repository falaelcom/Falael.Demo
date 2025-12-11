// R1Q1?/daniel
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LiberLudens.Gamebook.Builder.Book.Parsers
{
	/// <summary>
	/// This exception is thrown on an error during room lexing.
	/// </summary>
	public class RoomLexerException : Exception
	{
		#region Constructors
		/// <summary>
		/// Initializes a new instance of the <see cref="RoomLexerException"/> class with serialized data.
		/// </summary>
		/// <param name="info">The object that holds the serialized object data.</param>
		/// <param name="context">The contextual information about the source or destination.</param>
		public RoomLexerException(System.Runtime.Serialization.SerializationInfo info, System.Runtime.Serialization.StreamingContext context)
            : base(info, context)
        {
		}

		/// <summary>
		/// Initializes a new instance of the <see cref="RoomLexerException"/> class with a specified error message and a reference to the inner exception 
		/// that is the cause of this exception.
		/// </summary>
		/// <param name="message">The message that describes the error.</param>
		/// <param name="innerExeption">The exception that is the cause of the current exception. If the innerException parameter is not a null 
		/// reference, the current exception is raised in a catch block that handles the inner exception.
		/// </param>
		public RoomLexerException(string message, Exception innerExeption)
            : base(message, innerExeption)
        {
		}

		/// <summary>
		/// Initializes a new instance of the <see cref="RoomLexerException"/> class with a specified error message.
		/// </summary>
		/// <param name="message">The message that describes the error.</param>
		public RoomLexerException(string message)
            : base(message)
        {
		}

		/// <summary>
		/// Initializes a new instance of the <see cref="RoomLexerException"/> class with a specified error message and given parser state details.
		/// </summary>
		/// <param name="message">The message that describes the error.</param>
		/// <param name="columnNumber">
		/// The line number of the error.
		/// </param>
		/// <param name="lineNumber">
		/// The column number of the error.
		/// </param>
		/// <param name="state">
		/// A string expression of the state of the lexer at the moment when the error occured.
		/// </param>
		public RoomLexerException(string message, int lineNumber, int columnNumber, string state)
			: base(message)
		{
			this.lineNumber = lineNumber;
			this.columnNumber = columnNumber;
			this.state = state;
		}

		/// <summary>
		/// Initializes a new instance of the <see cref="RoomLexerException"/> class with given parser state details.
		/// </summary>
		/// <param name="columnNumber">
		/// The line number of the error.
		/// </param>
		/// <param name="lineNumber">
		/// The column number of the error.
		/// </param>
		/// <param name="state">
		/// A string expression of the state of the lexer at the moment when the error occured.
		/// </param>
		public RoomLexerException(int lineNumber, int columnNumber, string state)
		{
			this.lineNumber = lineNumber;
			this.columnNumber = columnNumber;
			this.state = state;
		}

		/// <summary>
		/// Initializes a new instance of the <see cref="RoomLexerException"/> class.
		/// </summary>
		public RoomLexerException()
		{
		}
		#endregion

		#region Interface
		/// <summary>
		/// The line number of the error.
		/// </summary>
		public int LineNumber
		{
			get
			{
				return this.lineNumber;
			}
		}
		/// <summary>
		/// The column number of the error.
		/// </summary>
		public int ColumnNumber
		{
			get
			{
				return this.columnNumber;
			}
		}
		/// <summary>
		/// A string expression of the state of the lexer at the moment when the error occured.
		/// </summary>
		public string State
		{
			get
			{
				return this.state;
			}
		}
		#endregion

		#region Infrastructure
		int lineNumber = -1;
		int columnNumber = -1;
		string state = null;
		#endregion
	}
}
