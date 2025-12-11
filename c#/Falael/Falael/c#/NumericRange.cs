//	R0Q4/daniel/20250914
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;

namespace Falael
{
	public struct NumericRange<TValue> where TValue : INumber<TValue>
	{
		public static readonly NumericRange<TValue> Empty = new() { Start = TValue.Zero, End = TValue.Zero };

		public required TValue Start;
		public required TValue End;

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public void Move(TValue offset)
		{
			this.Start += offset;
			this.End += offset;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsBefore(TValue index)
		{
			return this.End <= index;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsBeforeExclusive(TValue index)
		{
			return this.End < index;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsAfter(TValue index)
		{
			return this.Start >= index;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsAfterExclusive(TValue index)
		{
			return this.Start > index;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool Contains(NumericRange<TValue> right)
		{
			return this.Start <= right.Start && this.End >= right.End;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool Contains(TValue index)
		{
			return this.Start <= index && this.End > index;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool Overlaps(NumericRange<TValue> right)
		{
			return this.Start < right.End && right.Start < this.End;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsBefore(NumericRange<TValue> right)
		{
			return this.End <= right.Start;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsAfter(NumericRange<TValue> right)
		{
			return this.Start >= right.End;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool Touches(NumericRange<TValue> right)
		{
			return this.End == right.Start || right.End == this.Start;
		}

		public override bool Equals(object? obj)
		{
			if (obj is NumericRange<TValue> other)
				return this.Start == other.Start && this.End == other.End;
			return false;
		}

		public override int GetHashCode()
		{
			return HashCode.Combine(this.Start, this.End);
		}

		public override string ToString()
		{
			return $"{nameof(NumericRange<TValue>)}<{typeof(TValue).Name}>[{this.Length}] [{this.Start}, {this.End})";
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public bool IsInsideOf(NumericRange<TValue> outer)
		{
			return outer.Start <= this.Start && this.End <= outer.End;
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		public NumericRange<TValue> Intersection(NumericRange<TValue> right)
		{
			var s = this.Start > right.Start ? this.Start : right.Start;
			var e = this.End < right.End ? this.End : right.End;
			return new NumericRange<TValue> { Start = s, End = e };
		}

		[JsonIgnore]
		public TValue Length
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				return this.End - this.Start;
			}
		}

		[JsonIgnore]
		public bool IsValid
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				return this.Length >= TValue.Zero;
			}
		}

		[JsonIgnore]
		public bool IsEmpty
		{
			[MethodImpl(MethodImplOptions.AggressiveInlining)]
			get
			{
				return this.Length == TValue.Zero;
			}
		}
	}
}
