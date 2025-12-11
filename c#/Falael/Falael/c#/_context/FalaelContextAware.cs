using System.Text.Json.Serialization;

namespace Falael
{
	public class FalaelContextAware : IFalaelContextAware
	{
		public FalaelContextAware(IFalaelContext coreContext)
		{
			this.coreContext = coreContext;
		}

		#region ICoreContextAware

		[JsonIgnore]
		public IFalaelContext CoreContext
		{
			get { return this.coreContext; }
			protected set { this.coreContext = value; }
		}
		IFalaelContext coreContext;

		[JsonIgnore]
		public ILog Log { get { return this.CoreContext.Log; } }

		[JsonIgnore]
		public ConfigurationRepository ConfigurationRepository { get { return this.CoreContext.ConfigurationRepository; } }

		#endregion
	}
}