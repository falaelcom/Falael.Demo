Summary
===========================

This document describes exhaustively the behavior of fully conformant POSIX and GNU options parsers.

POSIX Conformance
===========================

Glossary
-------------------

### Command Line Argument Domain
|Term|Description|
|---|---|
|**Argument List**|A list of strings, e.g. the value of the program's main function's arguments parameter.|
|**Argument**|A single string item from the _Argument List_.|
|**Option Candidate**|An _Argument_ that consist of the `'-'` character followed by a single alpha-numerical character, e.g. `"-o"`.|
|**Option Group Candidate**|An _Argument_ that consist of the `'-'` character, followed by a list of alpha-numerical characters, e.g. `"-oabc"`.|
|**Option String Candidate**|An _Argument_ that consist of the `'-'` character, followed by a single alpha-numerical character and a list of arbitrary characters, e.g. `"-lsoa+-b"`.|
|**Operand List Start Candidate**|The `"--"` string.|
|**Non-option Argument**|An _Argument_ starting with any character other than `'-'`, or consisting of the sole `'-'` character.|

_NOTE: The terms "Option" from the Command Line Argument Domain does not imply that the corresponding Argument must be interpreted as an Option in the Option Domain. For Ex. an Option Candidate can be parsed as a Value, if immediately following an Option with a Required Value. The naming of the terms in the Command Line Argument Domain reflects the most common use of the syntactic construct but imposes no further limitations on interpretation._

### Option Domain
|Term|Description|
|---|---|
|**Schema**|A list of _Option_ names to be parsed as _Assignables_. For each name, indicates whether the expected value is an _Optional Value_ or a _Required Value_, in the form `(<name of Assignable>: char, valueRequired: boolean)`.|
|**Element**|The atom of the domain; a common term for _Options_ and _Operands_.|
|**Option**|A named _Element_; the name consists of a single alpha-numerical character; may or may not accept, require or have a _Value_.|
|**Flag**|An _Option_ that does not accept a value. All _Options_ not matched in the _Schema_ as _Assignables_ are treated as _Flags_. _Flags_ can be parsed from _Option Candidates_, e.g. `"-f"` (`f` can be a flag), _Option Group Candidates_, e.g. `"-lsf"` (`l, s, f` can be flags), and _Option String Candidates_, e.g. `"-lsfa+value"` (`l, s, f` can be flags).|
|**Assignable**|An _Option_ that accepts a _Value_. Defined by _Schema_. _Assignables_ can be parsed from _Option Candidates_, e.g. `"-a"`, _Option String Candidates_, e.g. `"-lsa"`, `"-lsasome+value"`, _Option Candidates_ combined with an immediately-following _Argument_, e.g. `"-a some+value"`, and from the last character of an _Option Group Candidates_ combined with an immediately-following _Argument_, e.g. `"-lsa some+value"`.|
|**Value**|The value part of an _Assignable_; parsed either from an _Argument_ immediately following an _Option Candidate_, e.g. `"-a some+value"`, or from an _Option String Candidate_, e.g. `"-lsasome+value"`.|
|**Optional Value**|An _Assignable_ may or may not require a _Value_ (specified by _Schema_). _Optional Values_ are parsed strictly from _Option String Candidates_, e.g. `"-asome+value", "-lsasome+value"`, as opposed to _Required Values_, which are parsed from separate _Arguments_ as well, e.g. `"-a some+value", "-lsa some+value"`.|
|**Required Value**|A non-optional _Value_. See _Optional Value_.|
|**Operand**|Can be any  _Argument_ that is not parsed as an _Option_ or a _Value_. The _Operand_ parsing is configuration- and context-specific (see _Strict Mode_).|
|**Strict Mode**|A boolean value altering the _Operand_ list start detection. In _Strict Mode_, the first _Non-option Argument_ and all subsequent _Arguments_ or all _Arguments_ following the first _Operand List Start Candidate_ are parsed as _Operands_, which comes first; in Non-_Strict Mode_, all _Non-option Arguments_ that are not _Values_ and all _Arguments_ following the first _Operand List Start Candidate_ are parsed as _Operands_.|

_NOTE: Although the POSIX Command Line Arguments Parser does handle Required Value validation, which is significant to the parsing process itself, it doesn't have any knowledge of which options are required or mutually exclusive. Option rules are a subject of subsequent validation of the output produced by the parser._

Further Notes
-------------------
- A single-character `'-'` _Argument_, as in `"app -abc - zz"`, is parsed as an _Operand_.
- An _Argument List_ consisting of a single `"--"`, as in `"app --"`, produces a single _Operand List Start Candidate_ in the _Command Line Argument Domain_ and no _Elements_ in the _Option Domain_.
- _Flag_ groups are allowed to end with one _Assignable_ including its _Value_ as a part of the same _Argument_ (_Optional Values_ and _Required Values_) or as the next _Argument_ (_Required Values_ only), as in `"-bcavalue"`, `"-bca value"`, `"-bca"` (in the last example `a` is an _Assignable_ with an _Optional Value_ that has been ommitted).
- _Values_ can start with the `'-'`, as in `"-a --"`, `"-a--"`, `"-a --xyz"`, `"-a--xyz"`, `"-a -value"`, `"-a-value"`, `"-lsa --"`, `"-lsa--"`, `"-lsa --xyz"`, `"-lsa--xyz"`, `"-lsa -value"`, `"-lsa-value"`. When parsing an _Assignable_ with a _Required Value_, the second _Argument_ is always parsed as a _Value_ regardless of it's subtype, be it a _Non-option Argument_, an _Option Candidate_, an _Option Group Candidate_, an _Option String Candidate_ or an _Operand List Start Candidate_.
- _Assignables_ with _Optional Values_ can be given only as a single _Argument_, as in `"-avalue"`, `"-bcavalue"`. _Assignables_ with _Required Values_ can be given both as a single _Argument_, as in `"-avalue"`, `"-bcavalue"`, and as two _Arguments_, as in `"-a value"`, `"-lsa value"`.
- The definition of an alpha-numerical character depends on the implementation and the runnning environment. The `getopt` C implementation relies on the standard function `isalnum`. We recommend that the implementation in other laguages defaults to a language's built-in alpha-numeric testing method (e.g. `System.Char.IsLetterOrDigit(char)` for C#, which matches characters in UTF-8), and provides a method to override this behavior with a custom function.
- The order of all _Options_ and _Operands_ is considered relevant. We recommend that the option parsers produce three separate collections: 1. an ordered list of all _Options_, 2. an ordered list of all _Operands_ and 3. an ordered list of all _Elements_.
- In _Strict Mode_, the first `"--"` _Argument_ may (e.g. `"app -o op -- op2"`) or may not (e.g. `"app -o -- op op2"`) be parsed as an _Operand_. The first example will produce the _Option_ `'o'` and the _Operands_ `"op", "--", "op2"`; the second example will produce the _Option_ `'o'` and the _Operands_ `"op", "op2"`.
- The POSIX guidelines specify that _"The -W (capital-W) option shall be reserved for vendor options."_, which implies that the `-W` _Option_ shall be treated as an _Assignable_. By default the parser treats `"-W"` as an _Assignable_ with a _Required Value_ and throws an exception if the _Schema_ already contains an _Assignable_ with the same name. Non-standard behaviors can be implemented and enforced via parser's configuration.


GNU Conformance
===========================

GNU options implement the POSIX standard, with the following extensions:

Glossary
-------------------

### Command Line Argument Domain
|Term|Description|
|---|---|
|**Long Option Candidate**|An _Argument_ that consist of the `"--"` string followed by a string of alpha-numerical characters and dashes (`'-'`), optionally followed by an equal sign (`'='`) and an arbitrary _Long Option Value_ string, e.g. `"--long-option"`, `"--long-option="`, `"--long-option=value"`, `"--long-option='option value+++'"`.|

### Option Domain
|Term|Description|
|---|---|
|**Long Option Schema**|A list of _Long Option_ names to be parsed as _Long Assignables_. For each name, indicates whether the expected value is an _Long Option Optional Value_ or a _Long Option Required Value_, in the form `(<long assignable name>: string, <value required>: boolean)`.|
|**Long Option**|A named _Element_; parsed from a _Long Option Candidate_; may or may not accept, require or have a _Long Option Value_.|
|**Long Flag**|A _Long Option_ that does not accept a value. All _Long Options_ not matched in the _Long Option Schema_ as _Long Assignables_ are treated as _Long Flags_. _Long Flags_ can be parsed from _Long Option Candidates_, e.g. `"--long-flag"`.|
|**Long Assignable**|An _Option_ that accepts a _Long Option Value_. Defined by _Long Option Schema_. _Assignables_ can be parsed from _Long Option Candidates_, e.g. `"--long-option"`, `"--long-option="`, `"--long-option=value"` and _Long Option Candidates_ combined with an immediately-following _Argument_, e.g. `"--long-option value"`.|
|**Long Option Value**|The value part of a _Long Assignable_; parsed either from an _Argument_ immediately following a _Long Option Candidate_, e.g. `"--long-option value"`, or from the part following the first equal sign (`'='`) in an _Long Option Candidate_, e.g. `"-long-option=value"`.|
|**Long Option Optional Value**|A _Long Assignable_ may or may not require a _Long Option Value_ (specified by _Long Option Schema_). _Long Option Optional Values_ are parsed strictly from _Long Option Candidates_, e.g. `"--long-option=value"`, as opposed to _Long Option Required Values_, which are parsed from separate _Arguments_ as well, e.g. `"--long-option value"`.|
|**Long Option Required Value**|A non-optional _Long Option Value_. See _Long Option Optional Value_.|

Further Notes
-------------------
- _Long Option Values_ can start with the `'-'`, as in `"--long-option=--"`, `"--long-option --"`, `"--long-option=-value"`, `"--long-option -value"`, `"--long-option=--value"`, `"--long-option --value"`. When parsing a _Long Assignable_ with a _Long Option Required Value_, the second _Argument_ is always parsed as a _Long Option Value_ regardless of it's subtype, be it a _Non-option Argument_, an _Option Candidate_, a _Long Option Candidate_, an _Option Group Candidate_,  an _Option String Candidate_ or an _Operand List Start Candidate_).
- _Long Assignables_ with _Long Option Optional Values_ can be given only as a single _Long Option Candidate_, as in `"--long-option=value"`. _Long Assignables_ with _Long Option Required Values_ can be given both as a single _Long Option Candidate_, as in `"--long-option=value"`, and as two _Arguments_, as in `"-long-option value"`.
- A _Long Option_ is matched as a _Long Assignable_ defined by _Long Option Schema_ if there is exactly one _Long Assignable_ name in the _Long Option Schema_ that starts with the _Long Option_ name. Given the _Schema_ `[("long-option", ValueOptional), ("long-island", ValueOptional)]`, the following options will be parsed as _Long Assignables_: `"--long-option"`, `"--long-optio"`, `"--long-o"`, `"--long-l"`, and the following will not: `"--long-"`, `"--long"`, `"--l"`, `"--z"`.
- While partial name matching is applicable to both _Long Assignables_ and _Long Flags_, only the _Long Assignable_ partial name matching is significant for the GNU parser, which needs to know whether an _Long Option_ is a _Long Assignable_ and whether its _Long Option Value_ is required in order to parse the input correctly. A complete partial name matching that also considers _Long Flags_ is a subject of subsequent analysis and processing.
- The GNU arguments parser does not extend the `"-W vendor-specific-options"` treatment of the POSIX parser. Translating `"-W long-option"` to `"--long-option"` as per the GNU specification (GNU libc 2+) does not fall into the parser's scope and is a subject of subsequent analysis and processing.

Sources
===========================
- [POSIX.1-2017](https://pubs.opengroup.org/onlinepubs/9699919799/)
- [POSIX - Utility Argument Syntax](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html#tag_12_01)
- [POSIX - Utility Syntax Guidelines](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html#tag_12_02)
- [POSIX, GNU - getopt](https://refspecs.linuxfoundation.org/LSB_1.3.0/gLSB/gLSB/libutil-getopt-3.html)
- [GNU - Program Argument Syntax Conventions](https://www.gnu.org/software/libc/manual/html_node/Argument-Syntax.html)
- [GNU - Using the getopt function](https://www.gnu.org/software/libc/manual/html_node/Using-Getopt.html)
- [GNU - Long Option Style](https://www.gnu.org/software/tar/manual/html_node/Long-Options.html)