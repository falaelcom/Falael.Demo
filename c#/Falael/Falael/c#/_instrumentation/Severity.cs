namespace Falael
{
    public enum Severity
	{
		/// <summary>
		/// Indicates diagnostic logging that is usually not delivered directly to the user
		///		- does not result in a loop break;
		///		- does not cause the application to shut down.
		/// </summary>
		Diagnostic = 1000000,

		/// <summary>
		/// Indicates normal system operation to the user. Use to record the following cases:
		///		- problem domain- and high-level buisness logic events; the terminolugy used must belong to the problem domain;
		///		- start, progress and end of long-running processes that might be of user concern
		///		- does not result in a loop break;
		///		- does not cause the application to shut down.
		/// </summary>
		Neutral = 100000,

		/// <summary>
		/// Indicates:
		///		- a forseeable exceptional condition (unlike Alert)
		///		- a pre-error or unexpected condition that doesn't prevent the operation from finishing; might indicate a possible unexpected behavior or result;
		///		- an early indication for resource exhaustion (e.g. a connection pool has reached 80% of capacity);
		///		- does not result in a loop break;
		///		- does not cause the application to shut down.
		/// </summary>
		Warning = 10000,

		/// <summary>
		/// Indicates:
		///		- an unforseeable exceptional condition (unlike Warning)
		///		- a recoverable error during isolated operation that might require user attention; in loops, only the current operation will be aborted;
		///		- an urgent indication for resource exhaustion (e.g. a connection pool has reached 95% of capacity, edging towards complete exhaustion, an Error/Critical/Fatal event seems immininent);
		///		- does not result in a loop break;
		///		- does not cause the application to shut down.
		/// </summary>
		Alert = 1000,

		/// <summary>
		/// Indicates:
		///		- an unrecoverable error during isolated operation (e.g. giving up the operation after the error, manual intervention is required to repeat the operation);
		///		- complete resource exhaustion during isolated operation (e.g. a connection pool out of capacity, current operation must be aborted, manual intervention is required to repeat the operation);
		///		- causes a loop break or is violating user expectations for routine operation;
		///		- does not cause the application to shut down.
		/// </summary>
		Error = 100,

		/// <summary>
		/// Indicates a manually-recoverable or recoverable-over-time critical event that leaves the application in degraded state (e.g. database connection loss, insufficient memory).
		///		- causes a loop break;
		///		- does not cause the application to shut down.
		/// </summary>
		Critical = 10,

		/// <summary>
		/// Indicates an unrecoverable application event forcing application shutdown (e.g. an unhandled exception).
		///		- causes a loop break;
		///		- causes application shut down.
		/// </summary>
		Fatal = 0,
	}
}
