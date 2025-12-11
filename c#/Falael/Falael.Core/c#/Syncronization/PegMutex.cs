namespace Falael.Core.Syncronization
{
	public class PegMutex : FalaelContextAware, IPegMutex
	{
		public PegMutex(
			IFalaelContext coreContext,
			Configuration configuration
		) : base(coreContext)
		{
			this.configuration = configuration;
			this.peg_LockHandle_Options = new()
			{
				FullFilePath = this.configuration.App_Mutex_PegFilePath,
				Timeout = this.configuration.App_Mutex_Timeout,
				PollingInterval = this.configuration.App_Mutex_PollingInterval,
			};
		}

		#region Configuration

		[ConfigurationClass]
		public class Configuration
		{
			#region app.mutex

			/// <summary>
			/// The path of the peg file, e.g. `"fs-lock.peg"`.
			/// </summary>
			[ConfigurationField("app.mutex.pegFilePath")]
			public string App_Mutex_PegFilePath { get; init; } = "fs-lock.peg";

			/// <summary>
			/// A time inteval for a file system peg to wait to acquire a lock before giving up, e.g. `"00:01:00"`.
			/// </summary>
			[ConfigurationField("app.mutex.timeout")]
			public TimeSpan App_Mutex_Timeout { get; init; } = TimeSpan.FromMinutes(1);

			/// <summary>
			/// A time inteval for a file system peg to repeat locking attempts if it's been unable to acquire the lock, e.g. `"00:00:00.100"`.
			/// </summary>
			[ConfigurationField("app.mutex.pollingInterval")]
			public TimeSpan App_Mutex_PollingInterval { get; init; } = TimeSpan.FromMilliseconds(100);

			#endregion
		}

		#endregion

		#region IPegMutex

		public async Task<Peg> HoldPeg(string pegHolderName)
		{
			return await Peg.Hold(this.CoreContext, pegHolderName, this.peg_LockHandle_Options);
		}

		public string PegFilePath
		{
			get
			{
				return this.peg_LockHandle_Options.FullFilePath;
			}
		}

		#endregion

		readonly LockHandle.Options peg_LockHandle_Options;
		readonly Configuration configuration;
	}
}
