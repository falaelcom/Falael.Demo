using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Falael.Core
{
    public static class Units
    {
        const int DAYS_PER_YEAR = 366;
        const int DAYS_PER_MONTH = 30;

        #region Nested Types

        public class TimeSpanJsonConverter : JsonConverter<TimeSpan>
        {
            public override TimeSpan Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                string? timeSpanString = reader.GetString();
                return TimeSpan.Parse(timeSpanString ?? string.Empty);
            }

            public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
            {
                writer.WriteStringValue(value.ToString());
            }
        }

        public class TimeRateJsonConverter : JsonConverter<TimeRate>
        {
            public override TimeRate Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                if (reader.TokenType != JsonTokenType.StartObject)
                {
                    throw new JsonException("Expected StartObject token.");
                }

                TimeSpan unit = default;
                decimal value = default;

                while (reader.Read())
                {
                    if (reader.TokenType == JsonTokenType.EndObject)
                    {
                        return new TimeRate(unit, value);
                    }

                    if (reader.TokenType == JsonTokenType.PropertyName)
                    {
                        string? propertyName = reader.GetString();
                        reader.Read();
                        switch (propertyName)
                        {
                            case "unit":
                                unit = JsonSerializer.Deserialize<TimeSpan>(ref reader, options);
                                break;
                            case "value":
                                value = reader.GetDecimal();
                                break;
                        }
                    }
                }

                throw new JsonException("Incomplete JSON.");
            }

            public override void Write(Utf8JsonWriter writer, TimeRate value, JsonSerializerOptions options)
            {
                writer.WriteStartObject();
                writer.WritePropertyName("unit");
                JsonSerializer.Serialize(writer, value.Unit, options);
                writer.WritePropertyName("value");
                writer.WriteNumberValue(value.Value);
                writer.WriteEndObject();
            }
        }

        public readonly struct TimeRate
        {
            public TimeRate(TimeSpan unit, decimal value)
            {
				this.Unit = unit;
				this.Value = value;
            }

            public override string ToString()
            {
                if (this.Unit == TimeSpan.Zero) return "TimeRate.Infinity";
                return $"{this.Value} per {this.Unit}";
            }

            public override bool Equals([NotNullWhen(true)] object? obj)
            {
                if (obj is TimeRate right) return this.Unit.Equals(right.Unit) && this.Value == right.Value;
                return false;
            }

            public override int GetHashCode()
            {
                return this.Unit.GetHashCode() ^ this.Value.GetHashCode();
            }

            public static bool operator ==(TimeRate left, TimeRate right)
            {
                return left.Equals(right);
            }

            public static bool operator !=(TimeRate left, TimeRate right)
            {
                return !(left == right);
            }

            [JsonPropertyName("unit")]
            public TimeSpan Unit { get; }
            [JsonPropertyName("value")]
            public decimal Value { get; }

            public static readonly TimeRate Infinity = new(TimeSpan.Zero, -1);
        }

        public abstract class FuzzyRangeUnit<T> where T : struct
        {
            public FuzzyRangeUnit(T rangeStart, T? rangeEnd)
            {
				this.RangeStart = rangeStart;
				this.RangeEnd = rangeEnd;
            }

            public abstract T Collapse();

            public override bool Equals(object? obj)
            {
                if (obj is not FuzzyRangeUnit<T> right) return false;

                if (!Nullable.Equals(this.RangeEnd, right.RangeEnd)) return false;
                if (!this.RangeStart.Equals(right.RangeStart)) return false;

                return true;
            }

            public override int GetHashCode()
            {
                if (this.RangeEnd == null) return this.RangeStart.GetHashCode();
                return this.RangeStart.GetHashCode() ^ this.RangeEnd.GetHashCode();
            }

            public override string ToString()
            {
                return $"{this.RangeStart}-{this.RangeEnd?.ToString() ?? "Infinity"}";
            }

            protected static readonly Random random = new();

            [JsonPropertyName("start")]
            public T RangeStart { get; private set; }
            [JsonPropertyName("end")]
            public T? RangeEnd { get; private set; }
        }

        public abstract class FuzzyVarianceUnit<T> where T : struct
        {
            public FuzzyVarianceUnit(T baseValue, decimal variance)
            {
				this.BaseValue = baseValue;
				this.Variance = variance;
            }

            public abstract T Collapse();

            public override bool Equals(object? obj)
            {
                if (obj is not FuzzyVarianceUnit<T> right) return false;

                if (this.Variance != right.Variance) return false;
                if (!this.BaseValue.Equals(right.BaseValue)) return false;

                return true;
            }

            public override int GetHashCode()
            {
                return this.BaseValue.GetHashCode() ^ this.Variance.GetHashCode();
            }

            public override string ToString()
            {
                return $"{this.BaseValue}+-{100 * this.Variance:0.##%}";
            }

            protected static readonly Random random = new();

            [JsonPropertyName("base")]
            public T BaseValue { get; private set; }
            [JsonPropertyName("var")]
            public decimal Variance { get; private set; }
        }

        public class FuzzyTimeSpan : FuzzyRangeUnit<TimeSpan>
        {
            public FuzzyTimeSpan(TimeSpan rangeStart, TimeSpan? rangeEnd)
                : base(rangeStart, rangeEnd)
            {
                if (this.RangeEnd != null && this.RangeStart > this.RangeEnd) throw new ArgumentException("this.RangeStart > this.RangeEnd", nameof(rangeEnd));
            }

            public override TimeSpan Collapse()
            {
                lock (random)
                {
                    if (this.RangeEnd == null || this.RangeStart == this.RangeEnd) return this.RangeStart;
                    return TimeSpan.FromMilliseconds(random.Next((int)this.RangeStart.TotalMilliseconds, (int)this.RangeEnd.Value.TotalMilliseconds + 1));
                }
            }

            public static readonly FuzzyTimeSpan Zero = new(TimeSpan.Zero, null);
        }

        public class FuzzyTimeRate : FuzzyVarianceUnit<TimeRate>
        {
            public FuzzyTimeRate(TimeRate baseValue, decimal variance)
                : base(baseValue, variance)
            {
                if (this.Variance < 0) throw new ArgumentException("this.Variance > 1", nameof(variance));
            }

            public override TimeRate Collapse()
            {
                if (this.Variance == 0m) return this.BaseValue;

                lock (random)
                {
                    decimal varianceMultiplier = Math.Max(0, 1 + ((decimal)random.NextDouble() * 2 - 1) * this.Variance);
                    if (varianceMultiplier == 0) return TimeRate.Infinity;
                    TimeSpan variedUnit = TimeSpan.FromTicks((long)(this.BaseValue.Unit.Ticks * varianceMultiplier));
                    return new TimeRate(variedUnit, this.BaseValue.Value);
                }
            }

            public static readonly FuzzyTimeRate Infinity = new(TimeRate.Infinity, 0m);
        }

        #endregion

        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <remarks>A month is considered 30 days; a year is considered 366 days.</remarks>
        /// <exception cref="FormatException"></exception>
        public static TimeSpan ParseTimeSpan(string input)
        {
            string text = input.Trim().ToLower();
            if (text == "0") return TimeSpan.Zero;

            var regex = new Regex(@"(?<number>\d+(\.\d+)?)(\s*)(?<unit>milliseconds|millisecond|seconds|minutes|second|minute|months|month|years|hours|msecs|year|hour|days|secs|mins|msec|day|mos|yrs|hrs|sec|min|dys|yr|hr|ds|ms|mo|dy|s|m|h|d|y)", RegexOptions.IgnoreCase);
            var matches = regex.Matches(text);

            if (matches.Count == 0) throw new FormatException($"Invalid time span format: \"{input}\".");

            double totalSeconds = 0;
            foreach (var match in matches.Cast<Match>())
            {
                var number = double.Parse(match.Groups["number"].Value, CultureInfo.InvariantCulture);
                var unit = match.Groups["unit"].Value.ToLower();

                totalSeconds += unit switch
                {
                    "ms" or "msec" or "msecs" or "millisecond" or "milliseconds" => number / 1000,
                    "s" or "sec" or "secs" or "second" or "seconds" => number,
                    "m" or "min" or "mins" or "minute" or "minutes" => number * 60,
                    "h" or "hr" or "hrs" or "hour" or "hours" => number * 3600,
                    "d" or "dy" or "dys" or "ds" or "days" => number * 86400,
                    "mo" or "mos" or "month" or "months" => number * DAYS_PER_MONTH * 86400,
                    "y" or "yr" or "yrs" or "year" or "years" => number * DAYS_PER_YEAR * 86400,
                    _ => throw new FormatException("Invalid time unit.")
                };
            }

            if (totalSeconds == 0) return TimeSpan.Zero;
            return TimeSpan.FromSeconds(totalSeconds);
        }

        public static TimeRate ParseTimeRate(string input)
        {
            string text = input.Trim().ToLower();
            if (string.IsNullOrEmpty(text)) return TimeRate.Infinity;

            decimal span = 1m;
            var regex_perUnit = new Regex(
                @"(?<rate>\d+(\.\d+)?)(\s*)(?<unit>per\s+millisecond|per\s+second|per\s+minute|per\s+month|per\s+hour|per\s+msec|per\s+year|per\s+day|per\s+sec|per\s+min|per\s+yr|per\s+hr|per\s+dy|pms|pmo|pm|ps|ph|pd|py)", RegexOptions.IgnoreCase);
            var match = regex_perUnit.Match(text);

            if (!match.Success)
            {
                var regex_perTimeSpan = new Regex(@"(?<rate>\d+(\.\d+)?)(\s*)per(\s*)(?<span>\d+(\.\d+)?)(\s*)(?<unit>milliseconds|millisecond|seconds|minutes|second|minute|months|month|years|hours|msecs|year|hour|days|secs|mins|msec|day|mos|yrs|hrs|sec|min|dys|yr|hr|ds|ms|mo|dy|s|m|h|d|y)", RegexOptions.IgnoreCase);
                match = regex_perTimeSpan.Match(text);
                if (!match.Success) throw new FormatException($"Invalid time rate format: {input}.");
                span = decimal.Parse(match.Groups["span"].Value, CultureInfo.InvariantCulture);
                if (span <= 0) throw new FormatException($"Invalid time rate format: {input}.");
            }
            decimal rate = decimal.Parse(match.Groups["rate"].Value, CultureInfo.InvariantCulture);
            if (rate <= 0) throw new FormatException($"Invalid time rate format: {input}.");
            string unit = match.Groups["unit"].Value;
            var normalizedUnit = Regex.Replace(unit, @"\s+", " ");

            TimeSpan rateUnit = normalizedUnit switch
            {
                "pms" or "per msec" or "per millisecond" => TimeSpan.FromMilliseconds(1),
                "ps" or "per sec" or "per second" => TimeSpan.FromSeconds(1),
                "pm" or "per min" or "per minute" => TimeSpan.FromMinutes(1),
                "ph" or "per hr" or "per hour" => TimeSpan.FromHours(1),
                "pd" or "per dy" or "per day" => TimeSpan.FromDays(1),
                "pmo" or "per month" => TimeSpan.FromDays(DAYS_PER_MONTH),
                "py" or "per yr" or "per year" => TimeSpan.FromDays(DAYS_PER_YEAR),

                "ms" or "msec" or "msecs" or "millisecond" or "milliseconds" => TimeSpan.FromMilliseconds((double)span),
                "s" or "sec" or "secs" or "second" or "seconds" => TimeSpan.FromSeconds((double)span),
                "m" or "min" or "mins" or "minute" or "minutes" => TimeSpan.FromMinutes((double)span),
                "h" or "hr" or "hrs" or "hour" or "hours" => TimeSpan.FromHours((double)span),
                "d" or "dy" or "dys" or "ds" or "days" => TimeSpan.FromDays((double)span),
                "mo" or "mos" or "month" or "months" => TimeSpan.FromDays(DAYS_PER_MONTH * (double)span),
                "y" or "yr" or "yrs" or "year" or "years" => TimeSpan.FromDays(DAYS_PER_YEAR * (double)span),

                _ => throw new FormatException($"Invalid time rate format: {input}.")
            };

            if (rateUnit == TimeSpan.Zero) return TimeRate.Infinity;
            return new TimeRate(rateUnit, rate);
        }

        #region Unit Tests

        public static void UnitTests_TryParseTimeSpan()
        {
            string input;
            TimeSpan outcome;

            //	test 000
            input = "0";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.Zero) throw new InvalidOperationException("Test 000 failed.");

            // Test for milliseconds
            input = "1000ms";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromSeconds(1)) throw new InvalidOperationException("Test for milliseconds failed.");

            // Test for milliseconds 2
            input = "1000 ms";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromSeconds(1)) throw new InvalidOperationException("Test for milliseconds 2 failed.");

            // Test for seconds
            input = "60s";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromMinutes(1)) throw new InvalidOperationException("Test for seconds failed.");

            // Test for minutes
            input = "60m";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromHours(1)) throw new InvalidOperationException("Test for minutes failed.");

            // Test for hours
            input = "24h";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromDays(1)) throw new InvalidOperationException("Test for hours failed.");

            // Test for days
            input = "7d";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromDays(7)) throw new InvalidOperationException("Test for days failed.");

            // Test for months (approximation)
            input = "1mo";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromDays(DAYS_PER_MONTH)) throw new InvalidOperationException("Test for months failed.");

            // Test for years (approximation)
            input = "1y";
            outcome = ParseTimeSpan(input);
            if (outcome != TimeSpan.FromDays(DAYS_PER_YEAR)) throw new InvalidOperationException("Test for years failed.");

            // Test combinations
            input = "1y 2mo 3d 4h 5m 6s";
            outcome = ParseTimeSpan(input);
            TimeSpan expectedOutcome = TimeSpan.FromDays(DAYS_PER_YEAR) + TimeSpan.FromDays(2 * DAYS_PER_MONTH) + TimeSpan.FromDays(3) + TimeSpan.FromHours(4) + TimeSpan.FromMinutes(5) + TimeSpan.FromSeconds(6);
            if (outcome != expectedOutcome) throw new InvalidOperationException("Test for combinations failed.");

            // Test decimal values
            input = "1.5h 30.75m";
            outcome = ParseTimeSpan(input);
            expectedOutcome = TimeSpan.FromMinutes(90) + TimeSpan.FromSeconds(1845);
            if (outcome != expectedOutcome) throw new InvalidOperationException("Test for decimal values failed.");

            // Test decimal values
            input = "1.5 h 30.75 m";
            outcome = ParseTimeSpan(input);
            expectedOutcome = TimeSpan.FromMinutes(90) + TimeSpan.FromSeconds(1845);
            if (outcome != expectedOutcome) throw new InvalidOperationException("Test for decimal values failed.");
        }

        public static void UnitTests_TryParseTimeRate()
        {
            string input;
            TimeRate outcome;

            // Test 000
            input = "1pms";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(1) || outcome.Value != 1) throw new InvalidOperationException("Test 000 failed.");

            // Test 000-a
            input = "0.1pms";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(1) || outcome.Value != 0.1m) throw new InvalidOperationException("Test 000-a failed.");

            // Test 001 - PerMillisecond
            input = "2 per millisecond";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(1) || outcome.Value != 2) throw new InvalidOperationException("Test 001 failed.");

            // Test 001-a - PerMillisecond
            input = "2.9 per millisecond";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(1) || outcome.Value != 2.9m) throw new InvalidOperationException("Test 001-a failed.");

            // Test 002 - PerSecond
            input = "3ps";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromSeconds(1) || outcome.Value != 3) throw new InvalidOperationException("Test 002 failed.");

            // Test 003 - PerSecond
            input = "4 per second";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromSeconds(1) || outcome.Value != 4) throw new InvalidOperationException("Test 003 failed.");

            // Test 004 - PerMinute
            input = "5pm";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMinutes(1) || outcome.Value != 5) throw new InvalidOperationException("Test 004 failed.");

            // Test 005 - PerMinute
            input = "6 per minute";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMinutes(1) || outcome.Value != 6) throw new InvalidOperationException("Test 005 failed.");

            // Test 006 - PerHour
            input = "7ph";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromHours(1) || outcome.Value != 7) throw new InvalidOperationException("Test 006 failed.");

            // Test 007 - PerHour
            input = "8 per hour";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromHours(1) || outcome.Value != 8) throw new InvalidOperationException("Test 007 failed.");

            // Test 008 - PerDay
            input = "9pd";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(1) || outcome.Value != 9) throw new InvalidOperationException("Test 008 failed.");

            // Test 009 - PerDay
            input = "10 per day";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(1) || outcome.Value != 10) throw new InvalidOperationException("Test 009 failed.");

            // Test 010 - PerMonth
            input = "11pmo";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_MONTH) || outcome.Value != 11) throw new InvalidOperationException("Test 010 failed.");

            // Test 011 - PerMonth
            input = "12 per month";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_MONTH) || outcome.Value != 12) throw new InvalidOperationException("Test 011 failed.");

            // Test 012 - PerYear
            input = "13py";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_YEAR) || outcome.Value != 13) throw new InvalidOperationException("Test 012 failed.");

            // Test 013 - PerYear
            input = "14 per year";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_YEAR) || outcome.Value != 14) throw new InvalidOperationException("Test 013 failed.");



            // Test 100
            input = "1 per 1 ms";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(1) || outcome.Value != 1) throw new InvalidOperationException("Test 000 failed.");

            // Test 100-a
            input = "0.1per 1 ms";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(1) || outcome.Value != 0.1m) throw new InvalidOperationException("Test 000-a failed.");

            // Test 101 - PerMilliseconds
            input = "2 per 0.1 milliseconds";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(0.1) || outcome.Value != 2) throw new InvalidOperationException("Test 001 failed.");

            // Test 101-a - PerMilliseconds
            input = "2.9 per 5 milliseconds";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMilliseconds(5) || outcome.Value != 2.9m) throw new InvalidOperationException("Test 001-a failed.");

            // Test 102 - PerSeconds
            input = "3per 100 s";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromSeconds(100) || outcome.Value != 3) throw new InvalidOperationException("Test 002 failed.");

            // Test 103 - PerSeconds
            input = "4 per 0.5 seconds";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromSeconds(0.5) || outcome.Value != 4) throw new InvalidOperationException("Test 003 failed.");

            // Test 104 - PerMinutes
            input = "5 per 1 m";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMinutes(1) || outcome.Value != 5) throw new InvalidOperationException("Test 004 failed.");

            // Test 105 - PerMinutes
            input = "6per 1 minute";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromMinutes(1) || outcome.Value != 6) throw new InvalidOperationException("Test 005 failed.");

            // Test 106 - PerHours
            input = "7 per 1 h";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromHours(1) || outcome.Value != 7) throw new InvalidOperationException("Test 006 failed.");

            // Test 107 - PerHours
            input = "8 per 10 hours";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromHours(10) || outcome.Value != 8) throw new InvalidOperationException("Test 007 failed.");

            // Test 108 - PerDays
            input = "9 per 1 d";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(1) || outcome.Value != 9) throw new InvalidOperationException("Test 008 failed.");

            // Test 109 - PerDay
            input = "10 per 1 days";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(1) || outcome.Value != 10) throw new InvalidOperationException("Test 009 failed.");

            // Test 110 - PerMonth
            input = "11per 1 mos";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_MONTH) || outcome.Value != 11) throw new InvalidOperationException("Test 010 failed.");

            // Test 111 - PerMonth
            input = "12 per 1 month";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_MONTH) || outcome.Value != 12) throw new InvalidOperationException("Test 011 failed.");

            // Test 112 - PerYear
            input = "13per 1 y";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_YEAR) || outcome.Value != 13) throw new InvalidOperationException("Test 012 failed.");

            // Test 113 - PerYear
            input = "14 per 1 year";
            outcome = ParseTimeRate(input);
            if (outcome.Unit != TimeSpan.FromDays(DAYS_PER_YEAR) || outcome.Value != 14) throw new InvalidOperationException("Test 013 failed.");

        }

        #endregion
    }
}