namespace Falael
{
    /// <summary>
	/// Only provided as a means for CLI verbosity option processing as a guideline on common levels. Not used by logger configuration.
	/// </summary>
	/// <remarks>
	/// The logger configuration on verbosity is done via <see cref="Severity"> and <see cref="LogDensity"/>.
	/// </remarks>
	public enum Verbosity
	{
		Insane,
		Trace,
		Debug,
		Info,
		Warning,
		Error,
		Critical,
	}
}
