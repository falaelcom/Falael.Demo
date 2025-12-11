using System.Diagnostics;
using System.Net;
using System.Text;

namespace Falael.Core.Web
{
	public class LightHttpServer : FalaelContextAware, IDisposable
	{
		const ulong LGID = 0xE8C14F;

		public LightHttpServer(IFalaelContext coreContext, string url, string name, Func<HttpListenerContext, Task<bool>> onRequestAsync)
			: base(coreContext)
		{
			this.Url = url;
			this.Name = name;
			this.onRequestAsync = onRequestAsync;

			this.listener = new HttpListener();
			this.listener.Prefixes.Add(this.Url);
			this.cts = new CancellationTokenSource();
			this.listener.Start();
			this.serverTask = _runServerAsync(this.cts.Token);

			async Task _runServerAsync(CancellationToken cancellationToken)
			{
				while (!cancellationToken.IsCancellationRequested)
				{
					try
					{
						var contextTask = this.listener.GetContextAsync();
						var completedTask = await Task.WhenAny(contextTask, Task.Delay(-1, cancellationToken));

						if (completedTask == contextTask)
						{
							var context = await contextTask;
							_ = _handleRequestAsync(context);
						}
						else break;
					}
					catch (OperationCanceledException ex)
					{
						this.Log.WriteLine(Severity.Warning, (LGID, 0x14D4D3),
							this.Name, nameof(LightHttpServer), nameof(_runServerAsync), ex
						);
						break;
					}
					catch (Exception ex)
					{
						this.Log.WriteLine(Severity.Alert, (LGID, 0x2DC759),
							this.Name, nameof(LightHttpServer), nameof(_runServerAsync), ex
						);
					}
				}

				async Task _handleRequestAsync(HttpListenerContext context)
				{
					try
					{
						await this.HandleRequestAsync(context);
					}
					catch (Exception ex)
					{
						Guid errorCode = Guid.NewGuid();

						this.Log.WriteLine(Severity.Error, (LGID, 0x571B1D),
							this.Name, nameof(LightHttpServer), nameof(_handleRequestAsync), errorCode, ex
						);

						try
						{
							var response = context.Response;
							response.StatusCode = 500;
							byte[] buffer = Encoding.UTF8.GetBytes(errorCode.ToString());
							response.ContentLength64 = buffer.Length;
							response.OutputStream.Write(buffer, 0, buffer.Length);
							response.Close();
						}
						catch (Exception ex2)
						{
							this.Log.WriteLine(Severity.Error, (LGID, 0xDE1E06),
								this.Name, nameof(LightHttpServer), nameof(_handleRequestAsync), "Error response", ex2
							);
						}
					}
				}
			}
		}

		#region IDisposable Pattern

		bool disposed = false;

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
					this.listener.Close();
				}
				this.disposed = true;
			}
		}

		~LightHttpServer()
		{
			this.Dispose(false);
		}

		//  non-thread-safe
		void ThrowIfDisposed()
		{
			ObjectDisposedException.ThrowIf(this.disposed, nameof(LightHttpServer));
		}

		#endregion

		async Task HandleRequestAsync(HttpListenerContext context)
		{
			var request = context.Request;
			var response = context.Response;

			this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xA2D64B),
				this.Name, nameof(LightHttpServer), nameof(HandleRequestAsync), "Request", request.HttpMethod, request.Url
			);

			if (request.Url == null)
			{
				this.Log.WriteLine(Severity.Warning, (LGID, 0x1D2537),
					this.Name, nameof(LightHttpServer), nameof(HandleRequestAsync), "Response", 400, "Invalid request", "request.Url == null"
				);
				response.StatusCode = 400;
			}
			else if (request.HttpMethod == "GET" && request.Url.AbsolutePath == "/echo")
			{
				var echoText = request.QueryString["echo"] ?? "(null)";
				var userAgent = request.Headers["User-Agent"];
				var cookieName = $"EchoCookie_{nameof(LightHttpServer)}{this.Name}";
				var cookieValue = request.Cookies[cookieName]?.Value ?? "(null)";

				var cookie = new Cookie(cookieName, echoText)
				{
					Expires = DateTime.Now.AddDays(1)
				};
				response.Cookies.Add(cookie);

				var responseString = $"UA:{userAgent} C:{cookieValue}>{echoText}";
				byte[] buffer = Encoding.UTF8.GetBytes(responseString);
				response.ContentLength64 = buffer.Length;
				response.OutputStream.Write(buffer, 0, buffer.Length);

				this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0x7F9A67),
					this.Name, nameof(LightHttpServer), nameof(HandleRequestAsync), "Response", 200, request.HttpMethod, request.Url,
					CL(responseString)
				);
				response.StatusCode = 200;
			}
			else
			{
				if (await this.onRequestAsync(context))
				{
					this.Log.WriteLine(LogDensity.LD_5_7, (LGID, 0xB58720),
						this.Name, nameof(LightHttpServer), nameof(HandleRequestAsync), "Response", response.StatusCode
					);
				}
				else
				{
					this.Log.WriteLine(Severity.Warning, (LGID, 0x957785),
						this.Name, nameof(LightHttpServer), nameof(HandleRequestAsync), "Response", 404, "Invalid request", request.HttpMethod, request.Url
					);
					response.StatusCode = 404;
				}
			}

			response.Close();
		}

		public string Url { get; }
		public string Name { get; }

		readonly HttpListener listener;
		readonly CancellationTokenSource cts;
		readonly Task? serverTask;
		readonly Func<HttpListenerContext, Task<bool>> onRequestAsync;
	}
}
