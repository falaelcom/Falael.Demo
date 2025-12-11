using System.Text.Json;

namespace Falael.Core.Storage
{
	public class JsonDatabase<TRootEntity> : FalaelContextAware, IDisposable where TRootEntity : class, new()
	{
		public const string MAIN_JSON_FILE_NAME = "main.json";

		public JsonDatabase(IFalaelContext coreContext, string directoryPath, JsonSerializerOptions jsonSerializerOptions)
			: base(coreContext)
		{
			this.DirectoryPath = directoryPath;
			this.JsonSerializerOptions = jsonSerializerOptions;

			this.FileStream = new FileStream(this.JsonFilePath, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Read);
			try
			{
				using var reader = new StreamReader(this.FileStream, leaveOpen: true);
				string json = reader.ReadToEnd();
				if (string.IsNullOrWhiteSpace(json)) this.rootEntity = new();
				else this.rootEntity = JsonSerializer.Deserialize<TRootEntity>(json, this.JsonSerializerOptions) ?? new();
				this.OnAfterUpdate();
			}
			catch
			{
				this.FileStream.Dispose();
				throw;
			}
		}

		public virtual void OnAfterUpdate() { }

		public async Task WriteAsync()
		{
			await this.sync.WaitAsync();
			try
			{
				string json = JsonSerializer.Serialize(this.RootEntity, this.JsonSerializerOptions);
				this.FileStream.SetLength(0);
				this.FileStream.Seek(0, SeekOrigin.Begin);
				using var writer = new StreamWriter(this.FileStream, leaveOpen: true);
				await writer.WriteAsync(json);
			}
			finally
			{
				this.sync.Release();
			}
		}

		public async Task RereadAsync()
		{
			await this.sync.WaitAsync();
			try
			{
				this.ThrowIfDisposed();
				this.FileStream.Seek(0, SeekOrigin.Begin);
				using var reader = new StreamReader(this.FileStream, leaveOpen: true);
				string json = await reader.ReadToEndAsync();
				if (string.IsNullOrWhiteSpace(json)) this.RootEntity = new();
				else this.RootEntity = JsonSerializer.Deserialize<TRootEntity>(json, this.JsonSerializerOptions) ?? new();
			}
			finally
			{
				this.sync.Release();
			}
		}

		#region IDisposable

		public void Dispose()
		{
			this.Dispose(true);
			GC.SuppressFinalize(this);
		}

		protected virtual void Dispose(bool disposing)
		{
			if (!this.disposed)
			{
				if (disposing)
				{
					this.sync.Wait();
					try
					{
						string json = JsonSerializer.Serialize(this.RootEntity, this.JsonSerializerOptions);
						this.FileStream.SetLength(0);
						this.FileStream.Seek(0, SeekOrigin.Begin);
						using var writer = new StreamWriter(this.FileStream, leaveOpen: false);
						writer.Write(json);
						this.FileStream = null!;
						this.RootEntity = null!;
					}
					finally
					{
						this.sync.Release();
					}
				}
				this.disposed = true;
			}
		}

		~JsonDatabase()
		{
			this.Dispose(false);
		}

		//  non-thread-safe
		void ThrowIfDisposed()
		{
			ObjectDisposedException.ThrowIf(this.disposed, nameof(JsonDatabase<TRootEntity>));
		}

		bool disposed = false;

		#endregion

		public string JsonFilePath
		{
			get
			{
				return Path.Combine(this.DirectoryPath, MAIN_JSON_FILE_NAME) ?? throw new NotSupportedException();
			}
		}

		public string DirectoryPath { get; }
		public JsonSerializerOptions JsonSerializerOptions { get; }

		protected TRootEntity RootEntity 
		{
			get => this.rootEntity;
			set
			{
				this.rootEntity = value;
				this.OnAfterUpdate();
			}
		}
		TRootEntity rootEntity;

		protected FileStream FileStream { get; set; }

		protected readonly SemaphoreSlim sync = new(1, 1);
	}
}
