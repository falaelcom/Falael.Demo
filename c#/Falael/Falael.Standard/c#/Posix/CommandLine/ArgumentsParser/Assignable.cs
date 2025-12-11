//	R0Q0/daniel/20201018
using System;

namespace Falael.Posix.CommandLine.ArgumentsParser
{
    /// <summary>
    /// Represents a schema definition item for an assignable option.
    /// </summary>
    public class Assignable
    {
        /// <summary>
        /// Creates an instance of this class with a given name and specifying whether the assignable requires a value.
        /// </summary>
        /// <param name="name">The name of the assignable.</param>
        /// <param name="valueRequired">Indicates whether the assignable requires a value.</param>
        public Assignable(char name, bool valueRequired = false)
        {
            this.Name = name;
            this.ValueRequired = valueRequired;
        }

        /// <summary>
        /// The name of the assignable.
        /// </summary>
        public char Name { get; }
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
        /// Returns true if an <see cref="Assignable"/> with the specified name is found, otherwise returns null.
        /// </summary>
        /// <param name="left">The array to traverse.</param>
        /// <param name="name">A name of an assignable to look for.</param>
        /// <returns>Returns true if an <see cref="Assignable"/> with the specified name is found, otherwise returns null.</returns>
        public static bool Contains(this Assignable[] left, char name)
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
        public static Assignable Find(this Assignable[] left, char name)
        {
            for (int length = left.Length, i = 0; i < length; ++i) if (left[i].Name == name) return left[i];
            return null;
        }

        /// <summary>
        /// Validates the names of the assignables. Names are considered valid if they consist of alpha-numerical charactrs (UTF-8) or are matched by the <paramref name="isAlnum"/> function.
        /// </summary>
        /// <param name="left">The array to traverse.</param>
        /// <param name="isAlnum">If set will be used to test options for satisfying the POSIX requirement for alpha-numerical option names.</param>
        /// <exception cref="ArgumentException">Thrown on an invalid name.</exception>
        public static void Validate(this Assignable[] left, Func<char, bool> isAlnum = null)
        {
            for (int length = left.Length, i = 0; i < length; ++i)
            {
                var item = left[i];
                bool outcome = isAlnum == null ? char.IsLetterOrDigit(item.Name) : isAlnum(item.Name);
                if (!outcome) throw new ArgumentException(item.Name.ToString());
            }
        }
    }
}
