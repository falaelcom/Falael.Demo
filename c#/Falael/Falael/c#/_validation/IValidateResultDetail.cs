using Falael.TranscribeProtocol;

namespace Falael
{
	public interface IValidateResultDetail
	{
		static abstract IValidateResultDetail Create(object? head, Cardinality? headCardinality, object? label, Cardinality? labelCardinality, object? tail, Cardinality? tailCardinality);
	}
}
