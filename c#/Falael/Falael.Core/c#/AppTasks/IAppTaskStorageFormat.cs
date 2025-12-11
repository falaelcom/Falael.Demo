namespace Falael.Core.AppTasks
{
	public interface IAppTaskStorageFormat
	{
		bool Recognize(string[] instanceTags);
		object? ReadObject(string text, object? deserializationContext);
		string WriteObject(object? value);
		Type AppTaskType { get; }
	}

	public interface IAppTaskStorageFormat<T> : IAppTaskStorageFormat
	{
		T? Read(string text, object? deserializationContext);
		string Write(T? value);
	}
}