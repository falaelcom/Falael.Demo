namespace Falael.Core.Services
{
	public abstract class MeteredService<TUsageMeter> : FalaelContextAware
	{
		protected MeteredService(IFalaelContext coreContext, TUsageMeter usageMeter, TimeSpan hibernateTimeout)
			: base(coreContext)
		{
			this.UsageMeter = usageMeter;
			this.HibernateTimeout = hibernateTimeout;
		}

		public TUsageMeter UsageMeter { get; }
		public TimeSpan HibernateTimeout { get; }
	}
}