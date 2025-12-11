//	R0Q0/daniel/20201018
using System;
using System.Collections.Generic;

namespace Falael.Gnu.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Represents a schema definition item for an assignable option.
    /// </summary>
    public class Assignable
    {
        /// <summary>
        /// Creates an instance of this class with a given string name and specifying whether the assignable requires a value.
        /// </summary>
        /// <param name="name">The name of the assignable.</param>
        /// <param name="valueRequired">Indicates whether the assignable requires a value.</param>
        public Assignable(string name, bool valueRequired = false)
        {
            this.Name = name;
            this.ValueRequired = valueRequired;
        }

        /// <summary>
        /// Creates an instance of this class with a given single-character name and specifying whether the assignable requires a value.
        /// </summary>
        /// <param name="name">The name of the assignable.</param>
        /// <param name="valueRequired">Indicates whether the assignable requires a value.</param>
        public Assignable(char name, bool valueRequired = false)
        {
            this.Name = name.ToString();
            this.ValueRequired = valueRequired;
        }

        /// <summary>
        /// The name of the assignable.
        /// </summary>
        public string Name { get; }
        /// <summary>
        /// Indicates whether the assignable requires a value.
        /// </summary>
        public bool ValueRequired { get; }
    }

    /// <summary>
    /// FileExtension methods for <see cref="Assignable"/>
    /// </summary>
    public static class ExtensionMethods_Assignable
    {
        /// <summary>
        /// Returns an array of all assignables with single-character alpha-numeric names packed in <see cref="Posix.CommandLine.ArgumentsParser.Assignable"/> objects.
        /// </summary>
        /// <param name="left">The array to traverse.</param>
        /// <param name="isAlnum">If set will be used to test options for satisfying the POSIX requirement for alpha-numerical option names.</param>
        /// <returns>Returns an array of all assignables with single-character alpha-numeric names packed in <see cref="Posix.CommandLine.ArgumentsParser.Assignable"/> objects.</returns>
        public static Posix.CommandLine.ArgumentsParser.Assignable[] MakePosixSchema(this Assignable[] left, Func<char, bool> isAlnum = null)
        {
            if (left == null) return null;
            List<Posix.CommandLine.ArgumentsParser.Assignable> result = new List<Posix.CommandLine.ArgumentsParser.Assignable>();
            for (int length = left.Length, i = 0; i < length; ++i)
            {
                var item = left[i];
                if (item.Name.Length != 1) continue;
                var c = item.Name[0];
                bool outcome = isAlnum == null ? char.IsLetterOrDigit(c) : isAlnum(c);
                if(!outcome) continue;
                result.Add(new Posix.CommandLine.ArgumentsParser.Assignable(c, item.ValueRequired));
            }
            return result.ToArray();
        }

        /// <summary>
        /// Returns an array of all assignables with muti-character or non-alpha-numeric names packed in <see cref="Assignable"/> objects.
        /// </summary>
        /// <param name="left">The array to traverse.</param>
        /// <param name="isAlnum">If set will be used to test options for satisfying the POSIX requirement for alpha-numerical option names.</param>
        /// <returns>Returns an array of all assignables with muti-character or non-alpha-numeric names packed in <see cref="Assignable"/> objects.</returns>
        public static Assignable[] MakeGnuSchema(this Assignable[] left, Func<char, bool> isAlnum = null)
        {
            if (left == null) return null;
            List<Assignable> result = new List<Assignable>();
            for (int length = left.Length, i = 0; i < length; ++i)
            {
                var item = left[i];
                var c = item.Name[0];
                bool outcome = isAlnum == null ? char.IsLetterOrDigit(c) : isAlnum(c);
                if (item.Name.Length < 2 && outcome) continue;
                result.Add(item);
            }
            return result.ToArray();
        }

        /// <summary>
        /// Returns true if an <see cref="Assignable"/> with the specified name is found, otherwise returns null.
        /// </summary>
        /// <param name="left">The array to traverse.</param>
        /// <param name="name">A name of an assignable to look for.</param>
        /// <returns>Returns true if an <see cref="Assignable"/> with the specified name is found, otherwise returns null.</returns>
        public static bool Contains(this Assignable[] left, string name)
        {
            for (int length = left.Length, i = 0; i < length; ++i) if (left[i].Name == name) return true;
            return false;
        }

        /// <summary>
        /// Returns the first <see cref="Assignable"/> with the specified name or null if none is found.
        /// </summary>
        /// <param name="left">The array to traverse.</param>
        /// <param name="name">A name of an assignable to look for.</param>
        /// <returns>Returns the first <see cref="Assignable"/> with the specified name or null if none is found.</returns>
        public static Assignable Find(this Assignable[] left, string name)
        {
            List<Assignable> partialMatches = new List<Assignable>();
            for (int length = left.Length, i = 0; i < length; ++i) if (left[i].Name.StartsWith(name)) partialMatches.Add(left[i]);
            if (partialMatches.Count == 1) return partialMatches[0];
            return null;
        }

        /// <summary>
        /// Validates the names of the assignables. Names are considered valid if they consist of dashes and alpha-numerical charactrs (UTF-8) or characters matched by the <paramref name="isAlnum"/> function.
        /// </summary>
        /// <param name="left">The array to traverse.</param>
        /// <param name="isAlnum">If set will be used to test options for satisfying the POSIX requirement for alpha-numerical option names.</param>
        /// <exception cref="ArgumentException">Thrown on an invalid name.</exception>
        public static void Validate(this Assignable[] left, Func<char, bool> isAlnum = null)
        {
            for (int length = left.Length, i = 0; i < length; ++i)
            {
                var item = left[i];
                for (int jlength = item.Name.Length, j = 0; j < jlength; ++j)
                {
                    var jitem = item.Name[j];
                    bool outcome = isAlnum == null ? char.IsLetterOrDigit(jitem) : isAlnum(jitem);
                    if (!outcome && jitem != '-') throw new ArgumentException(item.Name);
                }
            }
        }
    }
}
