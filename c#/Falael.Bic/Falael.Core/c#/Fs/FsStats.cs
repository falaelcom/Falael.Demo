using System;
using System.Text;
using System.Collections.Generic;

namespace Falael.Core.Fs
{
	public class FsStats
	{
		#region Nested types
		public struct Error
		{
			public int bucket;
			public int index;
			public byte[] data;
			public FsStatsInfo FsStatsInfo;

			public override string ToString()
			{
				int windowLength = 50;
				int halfWindowLength = (int)Math.Round(windowLength / 2f);
				int start = 0;
				int end = this.data.Length;
				if (this.data.Length > windowLength)
				{
					if (this.index - halfWindowLength < 0)
					{
						start = 0;
						end = windowLength;
					}
					else if (this.index + halfWindowLength >= this.data.Length)
					{
						end = this.data.Length - 1;
						start = end - windowLength;
					}
					else
					{
						start = this.index - halfWindowLength;
						end = this.index + halfWindowLength;
					}
				}

				return string.Format("[{4}] ({0}, {1}, {2}) {3}",
					this.FsStatsInfo.TotalReadCount,
					this.index,
					this.data.Length - this.index,
					BitConverter.ToString(this.data, start, end - start),
					this.bucket
					);
			}
		}

		public struct FsStatsInfo
		{
			public decimal TotalMs;
			public decimal TotalReadMs;
			public decimal TotalWriteMs;
			public int TotalCount;
			public int TotalReadCount;
			public int TotalWriteCount;
			public long TotalLengthB;
			public long TotalReadLengthB;
			public long TotalWriteLengthB;

			public decimal AvgMs
			{
				get
				{
					return this.TotalMs / (decimal)this.TotalCount;
				}
			}
			public decimal AvgReadMs
			{
				get
				{
					return this.TotalReadMs / (decimal)this.TotalReadCount;
				}
			}
			public decimal AvgWriteMs
			{
				get
				{
					return this.TotalWriteMs / (decimal)this.TotalWriteCount;
				}
			}

			public decimal AvgTransferBpms
			{
				get
				{
					if (this.TotalMs == 0)
					{
						return 0;
					}
					return this.TotalLengthB / (decimal)this.TotalMs;
				}
			}
			public decimal AvgReadTransferBpms
			{
				get
				{
					if (this.TotalReadMs == 0)
					{
						return 0;
					}
					return this.TotalReadLengthB / (decimal)this.TotalReadMs;
				}
			}
			public decimal AvgWriteTransferBpms
			{
				get
				{
					if (this.TotalWriteMs == 0)
					{
						return 0;
					}
					return this.TotalWriteLengthB / (decimal)this.TotalWriteMs;
				}
			}

			public void CopyTo(FsStatsInfo fsStatsInfo)
			{
				fsStatsInfo.TotalMs = this.TotalMs;
				fsStatsInfo.TotalReadMs = this.TotalMs;
				fsStatsInfo.TotalWriteMs = this.TotalWriteMs;
				fsStatsInfo.TotalCount = this.TotalCount;
				fsStatsInfo.TotalReadCount = this.TotalReadCount;
				fsStatsInfo.TotalWriteCount = this.TotalWriteCount;
				fsStatsInfo.TotalLengthB = this.TotalLengthB;
				fsStatsInfo.TotalReadLengthB = this.TotalReadLengthB;
				fsStatsInfo.TotalWriteLengthB = this.TotalWriteLengthB;
			}
		}
		#endregion

		#region Operations
		public void AddReadInfo(decimal ms, int dataLength)
		{
			if (ms == 0)
			{
				return;
			}

			lock (this.sync)
			{
				this.Info.TotalMs += ms;
				this.Info.TotalReadMs += ms;
				++this.Info.TotalCount;
				++this.Info.TotalReadCount;

				this.Info.TotalLengthB += dataLength;
				this.Info.TotalReadLengthB += dataLength;
			}
		}
		public void AddWriteInfo(decimal ms, int dataLength)
		{
			if (ms == 0)
			{
				return;
			}

			lock (this.sync)
			{
				this.Info.TotalMs += ms;
				this.Info.TotalWriteMs += ms;
				++this.Info.TotalCount;
				++this.Info.TotalWriteCount;

				this.Info.TotalLengthB += dataLength;
				this.Info.TotalWriteLengthB += dataLength;
			}
		}
		public void AddError(int bucket, byte[] data, int index)
		{
			lock (this.sync)
			{
				var error = new Error { bucket = bucket, data = data, index = index };
				this.Info.CopyTo(error.FsStatsInfo);
				this.errors.Add(error);
			}
		}
		public string GetErrorText()
		{
			StringBuilder sb = new StringBuilder();
			for (int length = this.errors.Count, i = 0; i < length; ++i)
			{
				sb.AppendLine();
				sb.AppendFormat("- {0}", this.errors[i].ToString());
			}
			return sb.ToString();
		}
		public void TestUniformity(byte[] data, int errorBucket)
		{
			if (data == null)
			{
				throw new ArgumentNullException("data");
			}
			if (data.Length == 0)
			{
				return;
			}
			byte b = data[0];
			for (int length = data.Length, i = 0; i < length; ++i)
			{
				if (data[i] != b)
				{
					this.AddError(errorBucket, data, i);
					break;
				}
			}
		}
		public void TestUniformity(byte[] data, byte value, int errorBucket)
		{
			if (data == null)
			{
				throw new ArgumentNullException("data");
			}
			if (data.Length == 0)
			{
				return;
			}
			for (int length = data.Length, i = 0; i < length; ++i)
			{
				if (data[i] != value)
				{
					this.AddError(errorBucket, data, i);
					break;
				}
			}
		}
		#endregion

		#region Overrides
		public override string ToString()
		{
			return this.ToString(false);
		}
		public string ToString(bool listErrors)
		{
			return string.Format("Ra: {0}, Wa: {1}, Ta: {2}, R: {3:0000.00}ms ({4}), W: {5:0000.00}ms ({6}), T: {7:0000.00}ms ({8}){9}{10}",

				Format.AsTransferRate1024((decimal)this.Info.AvgReadTransferBpms, true) + " " + Math.Round(this.Info.AvgReadTransferBpms, 2) + " Bpms",
				Format.AsTransferRate1024((decimal)this.Info.AvgWriteTransferBpms, true) + " " + Math.Round(this.Info.AvgWriteTransferBpms, 2) + " Bpms",
				Format.AsTransferRate1024((decimal)this.Info.AvgTransferBpms, true) + " " + Math.Round(this.Info.AvgTransferBpms, 2) + " Bpms",

				Math.Round(this.Info.TotalReadMs, 2),
				Format.AsDataLength1024((ulong)this.Info.TotalReadLengthB, true) + " " + this.Info.TotalReadLengthB + " B",
				Math.Round(this.Info.TotalWriteMs, 2),
				Format.AsDataLength1024((ulong)this.Info.TotalWriteLengthB, true) + " " + this.Info.TotalWriteLengthB + " B",
				Math.Round(this.Info.TotalMs, 2),
				Format.AsDataLength1024((ulong)this.Info.TotalLengthB, true) + " " + this.Info.TotalLengthB + " B",

				this.errors.Count != 0 ? " ERRORS: " + this.errors.Count : string.Empty,
				this.errors.Count != 0 && listErrors ? this.GetErrorText() : string.Empty
			);
		}
		#endregion

		#region Fields
		public List<Error> errors = new List<Error>();
		public FsStatsInfo Info;

		object sync = new object();
		#endregion
	}
}
