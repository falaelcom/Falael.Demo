using Falael.Core.Syncronization;

namespace Falael.Core.Services
{
	public abstract class UsageMeter<TRateInfo> : FalaelContextAware
	{
		public UsageMeter(IFalaelContext coreContext, decimal initialOpsLimit, int concurrentOpsLimit)
			: base(coreContext)
		{
			if (initialOpsLimit <= 0) throw new ArgumentException("Limit must be positive", nameof(initialOpsLimit));
			if (initialOpsLimit > 1 && initialOpsLimit != Math.Floor(initialOpsLimit)) throw new ArgumentException("Limit must be a whole number when greater than 1", nameof(initialOpsLimit));
			if (concurrentOpsLimit <= 0) throw new ArgumentException("Limit must be positive", nameof(concurrentOpsLimit));

			this.InitialOpsLimit = initialOpsLimit;
			this.ConcurrentOpsLimit = concurrentOpsLimit;

			this.semaphoreSmart = new SemaphoreSmart(this.InitialOpsLimit);
		}

		//	non-thread-safe
		protected abstract Task<decimal> QuerySemaphoreLimit(TRateInfo? RateInfo);

		//	thread-safe
		public async Task<decimal> GetSemaphoreLimit()
		{
			await this.sync.WaitAsync();
			try
			{
				return await this.QuerySemaphoreLimit(this.rateInfo);
			}
			finally
			{
				this.sync.Release();
			}
		}

		//	thread-safe
		public async Task<decimal> Update(TRateInfo value)
		{
			await this.sync.WaitAsync();
			try
			{
				this.rateInfo = value;
				return await this.QuerySemaphoreLimit(this.rateInfo);
			}
			finally
			{
				this.sync.Release();
			}
		}

		public decimal InitialOpsLimit { get; }
		public int ConcurrentOpsLimit { get; }

		protected readonly SemaphoreSmart semaphoreSmart;

		protected readonly SemaphoreSlim sync = new(1, 1);

		TRateInfo? rateInfo;
	}
}