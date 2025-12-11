using Falael.TranscribeProtocol;

namespace Falael
{
	public partial interface IValidatable<TContext>
	{
		public class Result
		{
			public Result(IEnumerable<ValidateException>? details = null)
			{
				this.Details = details;
			}

			public Result(ValidateException detail)
			{
				this.Details = [detail];
			}

			public Result()
			{
			}


			public Result WithAddDetail(ValidateException detail)
			{
				return new(this.Details == null ? [detail] : [.. this.Details, detail]);
			}

			public Result WithAddDetails(IEnumerable<ValidateException> details)
			{
				return new(this.Details == null ? [.. details] : [.. this.Details, .. details]);
			}

			public Result WithCascadeResult(Result value)
			{
				if (value == IValidatable<TContext>.Success) return this;

				return new(this.Details == null ? [.. value.Details ?? []] : [.. this.Details, .. value.Details ?? []]);
			}

			public Result WithCascadeResults(IEnumerable<Result> value)
			{
				return new(
					this.Details == null
						? [.. value.Where(v => v.Details != null).SelectMany(v => v.Details!)]
						: [.. this.Details, .. value.Where(v => v.Details != null).SelectMany(v => v.Details!)]);
			}

			public bool Success => this.Details == null ? true : this.Details.All(v => v.Succsess);
			public IEnumerable<ValidateException>? Details { get; }

		}

	}
}
