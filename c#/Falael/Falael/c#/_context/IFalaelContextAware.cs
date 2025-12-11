namespace Falael
{
	public interface IFalaelContextAware
	{
		IFalaelContext CoreContext { get; }
		
		ILog Log { get; }
		ConfigurationRepository ConfigurationRepository { get; }
	}
}