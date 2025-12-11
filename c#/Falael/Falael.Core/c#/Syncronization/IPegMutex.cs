namespace Falael.Core.Syncronization
{
	public interface IPegMutex
	{
		Task<Peg> HoldPeg(string pegHolderName);

		string PegFilePath { get; }
	}
}